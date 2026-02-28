import { Server } from 'socket.io';
import { Game } from '../game/game';
import { ClientInfo } from '../../interfaces/clientInfo';
import { SINGLE, MULTI } from '../../constantes/constantes';
import { Player } from '../player/player';

export class WaitGame {
  private static _instance: WaitGame;
  private _server: Server;
  private games: Map<string, Game> = new Map(); // roomId / game
  private UUIDMapings: Map<string, ClientInfo> = new Map(); // uuid / socketId[] roomId[] name;

  private constructor(server: Server) {
    this._server = server;
  }

  public static getInstance(server: Server): WaitGame {
    if (!WaitGame._instance) {
      WaitGame._instance = new WaitGame(server);
    }
    return WaitGame._instance;
  }

  // ==================== GENERIC ROOM METHODS ====================

  /**
   * Rejoindre une room par nom (la créer si elle n'existe pas)
   * Premier joueur = host
   */
  public joinRoom(uuid: string, name: string, socketId: string, roomId: string): { success: boolean; reason?: string } {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return { success: false, reason: 'no_socket' };

    // Initialiser les infos du joueur s'il n'existe pas
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }

    // Créer la room si elle n'existe pas
    let game = this.games.get(roomId);
    if (game === undefined) {
      game = new Game([], roomId, MULTI, this._server);
      this.games.set(roomId, game);
    }

    // Bloquer le join si la partie est en cours ou en phase de décision
    if (game.getIsStarted() || game.getAwaitingDecisions()) {
      return { success: false, reason: 'game_started' };
    }

    // Vérifier si le joueur est déjà dans la room
    const waitPlayer = game.getWaitingPlayers().find((p) => p.getUuid() === uuid);
    const player = game.getPlayers().find((p) => p.getUuid() === uuid);
    const lostPlayer = game.getLostPlayers().find((p) => p.getUuid() === uuid);

    if (waitPlayer !== undefined || player !== undefined || lostPlayer !== undefined) {
      // Already in room — just ensure socket is joined and re-notify
      socket.join(roomId);
      this._notifyRoomPlayersUpdate(game, roomId);
      return { success: true };
    }

    // Vérifier que le nom n'est pas déjà pris dans la room
    const nameExists = game.getWaitingPlayers().some((p) => p.getPlayerName() === name);
    if (nameExists) {
      return { success: false, reason: 'name_taken' };
    }

    // Créer le joueur ; premier dans la room = host
    const newPlayer = new Player(name, uuid);
    if (game.getWaitingPlayers().length === 0) {
      newPlayer.setIsMaster(true);
    }

    game.addWaitingPlayer(newPlayer);
    socket.join(roomId);

    if (!infos.lobbyRoomsId.includes(roomId)) {
      infos.lobbyRoomsId.push(roomId);
    }

    // Notifier tous les joueurs de la room
    this._notifyRoomPlayersUpdate(game, roomId);
    return { success: true };
  }

  /**
   * Quitter une room
   */
  public leaveRoom(uuid: string, socketId: string, roomId: string): void {
    const game = this.games.get(roomId);
    if (game === undefined) return;

    const socket = this._server.sockets.sockets.get(socketId);
    const infos = this.UUIDMapings.get(uuid);

    // Chercher le joueur dans les 3 listes possibles
    const waitPlayer = game.getWaitingPlayers().find((p) => p.getUuid() === uuid);
    const playingPlayer = game.getPlayers().find((p) => p.getUuid() === uuid);
    const lostPlayer = game.getLostPlayers().find((p) => p.getUuid() === uuid);

    // Pas dans la room
    if (!waitPlayer && !playingPlayer && !lostPlayer) return;

    // Déterminer si le joueur qui quitte était l'hôte
    const wasHost =
      (waitPlayer && waitPlayer.getIsMaster()) ||
      (playingPlayer && playingPlayer.getIsMaster()) ||
      (lostPlayer && lostPlayer.getIsMaster()) ||
      false;

    // Retirer le joueur de la liste appropriée
    if (waitPlayer) {
      const index = game.getWaitingPlayers().findIndex((p) => p.getUuid() === uuid);
      if (index !== -1) {
        game.getWaitingPlayers().splice(index, 1);
      }
    }

    if (playingPlayer) {
      game.removePlayer(uuid);
    }

    if (lostPlayer) {
      game.removeLostPlayer(uuid);
    }

    // Si l'hôte quitte, transférer le rôle d'hôte
    if (wasHost) {
      this._transferHostInRoom(game, roomId);
    }

    // Déconnecter le socket de la room
    if (socket) {
      socket.leave(roomId);
    }

    // Retirer de la liste des rooms du joueur
    if (infos) {
      const index = infos.lobbyRoomsId.indexOf(roomId);
      if (index !== -1) {
        infos.lobbyRoomsId.splice(index, 1);
      }
    }

    // Si en phase de décision, retirer des pending
    if (game.getAwaitingDecisions() && game.getPendingDecisionUuids().has(uuid)) {
      game.getPendingDecisionUuids().delete(uuid);
      if (game.getPendingDecisionUuids().size === 0) {
        game.clearDecisionTimeout();
        game.setAwaitingDecisions(false);
        this._server.to(roomId).emit('decision_phase_ended', { roomId });
      }
    }

    // Nettoyer la room si vide
    if (
      game.getWaitingPlayers().length === 0 &&
      game.getPlayers().length === 0 &&
      game.getLostPlayers().length === 0
    ) {
      game.clearDecisionTimeout();
      this.games.delete(roomId);
      return;
    }

    // Notifier tous les joueurs restants
    this._notifyRoomPlayersUpdate(game, roomId);
  }

  /**
   * Démarrer la partie dans une room (seulement l'hôte peut démarrer)
   */
  public async startRoom(uuid: string, name: string, socketId: string, roomId: string): Promise<{ success: boolean; reason?: string }> {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return { success: false, reason: 'no_socket' };

    const game = this.games.get(roomId);
    if (game === undefined) return { success: false, reason: 'no_room' };

    if (game.getIsStarted() || game.getIsStarting()) return { success: false, reason: 'already_started' };
    if (game.getAwaitingDecisions()) return { success: false, reason: 'awaiting_decisions' };
    game.setIsStarting(true);

    // Vérifier que c'est l'hôte qui demande
    const host = game.getWaitingPlayers().find((p) => p.getIsMaster());
    if (host === undefined || host.getUuid() !== uuid) {
      return { success: false, reason: 'not_host' };
    }

    if (game.getWaitingPlayers().length < 1) {
      return { success: false, reason: 'no_players' };
    }

    if (game.getWaitingPlayers().length === 1) {
      // Mode solo : un seul joueur dans la room
      await game.startGame(this.UUIDMapings);
      const player = game.getPlayers()[0];
      const touch = { touch1: 1 };
      let gameIsOver = false;
      const gameLoop = () => {
        try {
          if (!this.games.has(roomId)) return;
          const socketsId = this.UUIDMapings.get(player.getUuid())?.socketsId as string[];
          game.gamePlay(player, touch, socketsId);
          if (!gameIsOver) gameIsOver = game.endGame(this.UUIDMapings);
          if (gameIsOver) {
            game.changePlayerToWaiting(player.getUuid());
            this._notifyRoomPlayersUpdate(game, roomId);
            return;
          }
          setTimeout(gameLoop, player.getDropInterval());
        } catch (e) {
          console.error('Game loop error (solo lobby):', e);
        }
      };
      setTimeout(gameLoop, player.getDropInterval());
    } else {
      // Mode multi : 2+ joueurs
      await game.startGame(this.UUIDMapings);
      const intervalId = setInterval(() => {
        try {
          if (!this.games.has(roomId)) {
            clearInterval(intervalId);
            return;
          }
          if (game.endGame(this.UUIDMapings)) {
            clearInterval(intervalId);
            this._startDecisionPhase(game, roomId);
            return;
          }
          game.gamePlayMulti(this.UUIDMapings);
        } catch (e) {
          clearInterval(intervalId);
          console.error('Game loop error (multi lobby):', e);
        }
      }, 1000);
    }

    return { success: true };
  }

  /**
   * Transférer le rôle d'hôte dans une room
   */
  private _transferHostInRoom(game: Game, roomId: string): void {
    let newHost: Player | null = null;

    if (game.getPlayers().length > 0) {
      newHost = game.getPlayers()[0];
    } else if (game.getLostPlayers().length > 0) {
      newHost = game.getLostPlayers()[0];
    } else if (game.getWaitingPlayers().length > 0) {
      newHost = game.getWaitingPlayers()[0];
    }

    if (newHost) {
      newHost.setIsMaster(true);
      this._server.to(roomId).emit('room_host_changed', {
        roomId: roomId,
        newHostUuid: newHost.getUuid(),
        newHostName: newHost.getPlayerName(),
      });
    }
  }

  /**
   * Notifier tous les joueurs d'une room
   */
  private _notifyRoomPlayersUpdate(game: Game, roomId: string): void {
    const rawPlayers = (game.getIsStarted() || game.getAwaitingDecisions())
      ? [...game.getWaitingPlayers(), ...game.getPlayers(), ...game.getLostPlayers()]
      : game.getWaitingPlayers();

    const seen = new Set<string>();
    const allPlayers = rawPlayers.filter((p) => {
      if (seen.has(p.getUuid())) return false;
      seen.add(p.getUuid());
      return true;
    });

    const playersList = allPlayers.map((p) => ({
      name: p.getPlayerName(),
      uuid: p.getUuid(),
      isHost: p.getIsMaster(),
    }));

    this._server.to(roomId).emit('room_players_update', {
      roomId: roomId,
      players: playersList,
      hostUuid: allPlayers.find((p) => p.getIsMaster())?.getUuid() || '',
      isStarted: game.getIsStarted(),
    });
  }

  // ==================== EXISTING METHODS ====================

  public getGames(): Map<string, Game> {
    return this.games;
  }

  public getUUIDMapings(): Map<string, ClientInfo> {
    return this.UUIDMapings;
  }

  public addSocket(uuid: string, socketId: string): void {
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: '',
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
      for (let i = 0; i < infos.ownedRoomsId.length; i++) {
        this._server.sockets.sockets.get(socketId)?.join(infos.ownedRoomsId[i]);
      }
      for (let i = 0; i < infos.otherRoomsId.length; i++) {
        this._server.sockets.sockets.get(socketId)?.join(infos.otherRoomsId[i]);
      }
    }
  }

  public deleteSocket(socketId: string): void {
    const uuidsToDelete: string[] = [];
    this.UUIDMapings.forEach((value, uuid) => {
      const index = value.socketsId.indexOf(socketId);
      if (index !== -1) {
        value.socketsId.splice(index, 1);
      }
      if (
        value.socketsId.length === 0 &&
        value.ownedRoomsId.length === 0 &&
        value.otherRoomsId.length === 0 &&
        value.lobbyRoomsId.length === 0
      ) {
        uuidsToDelete.push(uuid);
      }
    });
    for (const uuid of uuidsToDelete) {
      this.UUIDMapings.delete(uuid);
    }
  }

  public cleanupLegacyRooms(uuid: string): void {
    const infos = this.UUIDMapings.get(uuid);
    if (!infos) return;

    const ownedRooms = [...infos.ownedRoomsId];
    for (const roomId of ownedRooms) {
      const game = this.games.get(roomId);
      if (game) {
        game.removePlayerFromAll(uuid);
        if (game.isEmpty()) {
          this.games.delete(roomId);
        }
      }
    }
    infos.ownedRoomsId = [];

    const otherRooms = [...infos.otherRoomsId];
    for (const roomId of otherRooms) {
      const game = this.games.get(roomId);
      if (game) {
        game.removePlayerFromAll(uuid);
        if (game.isEmpty()) {
          this.games.delete(roomId);
        }
      }
    }
    infos.otherRoomsId = [];
  }

  public createGame(uuid: string, name: string, socketId: string) {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }
    let roomName = name;
    let i = 0;
    while (
      this.games.has(roomName) ||
      infos.ownedRoomsId.includes(roomName) ||
      infos.otherRoomsId.includes(roomName)
    ) {
      roomName = name + i;
      i++;
    }
    infos.ownedRoomsId.push(roomName);
    socket.join(roomName);
    const player = new Player(name, uuid);
    player.setIsMaster(true);
    const game = new Game([], roomName, MULTI, this._server);
    this.games.set(roomName, game);
    game.addWaitingPlayer(player);
    //
    const createRooms = [];
    for (let i = 0; i < infos.ownedRoomsId.length; i++) {
      if (
        this.getGames().get(infos.ownedRoomsId[i])?.getType() === MULTI &&
        !this.getGames().get(infos.ownedRoomsId[i])?.getIsStarted()
      ) {
        createRooms.push(infos.ownedRoomsId[i]);
      }
    }
    //
    this._server.to(infos.socketsId).emit('getCreateRooms', {
      createRooms: createRooms,
    });
  }

  public async joinGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ) {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }
    const game = this.games.get(roomId);
    if (game === undefined) return;
    const waitPlayer = game
      .getWaitingPlayers()
      .find((player) => player.getUuid() === uuid);
    const player = game
      .getPlayers()
      .find((player) => player.getUuid() === uuid);
    const lostPlayer = game
      .getLostPlayers()
      .find((player) => player.getUuid() === uuid);
    if (
      player !== undefined ||
      waitPlayer !== undefined ||
      lostPlayer !== undefined
    ) {
      return;
    }
    game.addWaitingPlayer(new Player(name, uuid));
    socket.join(roomId);
    if (!infos.otherRoomsId.includes(roomId)) {
      infos.otherRoomsId.push(roomId);
    }
    socket.emit('pageToGo', {
      pageInfos: {
        path: roomId + '/' + name,
        name: name,
        roomName: roomId,
      },
    });
  }

  public async startSingleTetrisGame(
    uuid: string,
    name: string,
    socketId: string,
  ): Promise<void> {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }
    let roomName = name;
    let i = 0;
    while (
      this.games.has(roomName) ||
      infos.ownedRoomsId.includes(roomName) ||
      infos.otherRoomsId.includes(roomName)
    ) {
      roomName = name + i;
      i++;
    }
    infos.ownedRoomsId.push(roomName);
    socket.join(roomName);
    const player = new Player(name, uuid);
    player.setIsMaster(true);
    const game = new Game([player], roomName, SINGLE, this._server);
    this.games.set(roomName, game);
    await this.pageToGo(uuid, roomName, SINGLE, player.getPlayerName());
    await game.startGame(this.UUIDMapings);
    const touch = { touch1: 1 };
    let gameIsOver = false;
    const gameLoop = () => {
      try {
        if (!this.games.has(roomName)) return;
        const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];

        game.gamePlay(player, touch, socketsId);
        if (!gameIsOver) gameIsOver = game.endGame(this.UUIDMapings);
        if (gameIsOver) {
          for (let i = 0; i < socketsId.length; i++) {
            const socket = this._server.sockets.sockets.get(socketsId[i]);
            if (socket !== undefined) socket.leave(roomName);
          }
          infos.ownedRoomsId.splice(infos.ownedRoomsId.indexOf(roomName), 1);
          this.games.delete(roomName);
          return;
        }
        setTimeout(gameLoop, player.getDropInterval());
      } catch (e) {
        console.error('Game loop error (single):', e);
      }
    };
    setTimeout(gameLoop, player.getDropInterval());
  }

  public notRetryGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ) {
    const sockets = this._server.sockets.sockets.get(socketId);
    if (sockets === undefined) return;
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (infos === undefined) return;
    const game = this.games.get(roomId);
    if (game === undefined) return;

    const player_lost = game
      .getLostPlayers()
      .find((player) => player.getUuid() === uuid);
    const player = game
      .getPlayers()
      .find((player) => player.getUuid() === uuid);
    const waitPlayer = game
      .getWaitingPlayers()
      .find((player) => player.getUuid() === uuid);

    if (player === undefined && player_lost === undefined && waitPlayer === undefined) {
      return;
    }

    // Si c'est le master, on le garde dans la room en waiting
    const isMaster =
      (player != undefined && player.getIsMaster()) ||
      (player_lost != undefined && player_lost.getIsMaster()) ||
      (waitPlayer != undefined && waitPlayer.getIsMaster());
    if (isMaster) {
      game.changePlayerToWaiting(uuid);
      return;
    }

    // Retirer le joueur de toutes les listes
    const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
    for (let i = 0; i < socketsId.length; i++) {
      const socket = this._server.sockets.sockets.get(socketsId[i]);
      if (socket !== undefined) socket.leave(roomId);
    }
    const otherIdx = infos.otherRoomsId.indexOf(roomId);
    if (otherIdx !== -1) {
      infos.otherRoomsId.splice(otherIdx, 1);
    }
    game.removePlayerFromAll(uuid);
    if (game.isEmpty()) {
      this.games.delete(roomId);
    }
  }

  private clearGame(game: Game) {
    const lostPlayers = game.getLostPlayers();
    const players = game.getPlayers();

    for (let i = 0; i < lostPlayers.length; i++) {
      const uuid = lostPlayers[i].getUuid();
      const roomId = game.getRoomId();

      if (lostPlayers[i].getIsMaster()) {
        game.changePlayerToWaiting(uuid);
        continue;
      }

      const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
      const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
      for (let i = 0; i < socketsId.length; i++) {
        const socket = this._server.sockets.sockets.get(socketsId[i]);
        if (socket !== undefined) socket.leave(roomId);
      }
      infos.otherRoomsId.splice(infos.otherRoomsId.indexOf(roomId), 1);
      game.removeLostPlayer(uuid);
    }
    for (let i = 0; i < players.length; i++) {
      const uuid = players[i].getUuid();
      const roomId = game.getRoomId();

      if (players[i].getIsMaster()) {
        game.changePlayerToWaiting(uuid);
        continue;
      }

      const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
      const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
      for (let i = 0; i < socketsId.length; i++) {
        const socket = this._server.sockets.sockets.get(socketsId[i]);
        if (socket !== undefined) socket.leave(roomId);
      }
      infos.otherRoomsId.splice(infos.otherRoomsId.indexOf(roomId), 1);
      game.removePlayer(uuid);
    }
  }

  public async retryGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ) {
    const sockets = this._server.sockets.sockets.get(socketId);
    if (sockets === undefined) return;
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (infos === undefined) return;
    const game = this.games.get(roomId);
    if (game === undefined) return;
    if (game.getIsStarted()) {
      sockets.emit('noGame');
    }
    let retryCount = 0;
    const maxRetries = 60; // timeout après 60 secondes
    const intervalId = setInterval(async () => {
      retryCount++;
      if (!this.games.has(roomId) || retryCount >= maxRetries) {
        clearInterval(intervalId);
        return;
      }
      if (game.getIsStarted() == false) {
        clearInterval(intervalId);
        game.changePlayerToWaiting(uuid);
        const player = game
          .getWaitingPlayers()
          .find((player) => player.getUuid() === uuid);
        if (player?.getIsMaster() === true) {
          await new Promise((resolve) => {
            setTimeout(() => {
              this.startMultiTetrisGame(uuid, name, socketId, roomId);
              resolve(1);
            }, 5000);
          });
        }
      }
    }, 1000);
  }

  public async startMultiTetrisGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ): Promise<void> {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) return;
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    const game = this.games.get(roomId);
    if (game === undefined) return;
    if (game.getIsStarted() || game.getIsStarting()) return;
    game.setIsStarting(true);

    this.clearGame(game);

    if (game.getWaitingPlayers().length <= 1) {
      this._server.to(socketId).emit('not_enough_person', {
        message: 'Not enough person to start the game',
      });
      return;
    }

    await game.startGame(this.UUIDMapings);
    const intervalId = setInterval(() => {
      try {
        if (!this.games.has(roomId)) {
          clearInterval(intervalId);
          return;
        }
        if (game.endGame(this.UUIDMapings)) {
          clearInterval(intervalId);
          const uuidsToMove = [
            ...game.getPlayers().map((p) => p.getUuid()),
            ...game.getLostPlayers().map((p) => p.getUuid()),
          ];
          for (const playerUuid of uuidsToMove) {
            game.changePlayerToWaiting(playerUuid);
          }
          return;
        }
        game.gamePlayMulti(this.UUIDMapings);
      } catch (e) {
        clearInterval(intervalId);
        console.error('Game loop error (multi legacy):', e);
      }
    }, 1000);
  }

  // ==================== DECISION PHASE (Play with Anyone) ====================

  private _startDecisionPhase(game: Game, roomId: string): void {
    const allUuids = [
      ...game.getPlayers().map((p) => p.getUuid()),
      ...game.getLostPlayers().map((p) => p.getUuid()),
    ];

    game.setAwaitingDecisions(true);
    game.getPendingDecisionUuids().clear();
    for (const uuid of allUuids) {
      game.getPendingDecisionUuids().add(uuid);
    }

    this._notifyRoomPlayersUpdate(game, roomId);
    this._server.to(roomId).emit('awaiting_decisions', {
      roomId,
      timeout: 5,
    });

    const timeoutId = setTimeout(() => {
      this._processDecisionTimeout(game, roomId);
    }, 5000);
    game.setDecisionTimeoutId(timeoutId);
  }

  private _processDecisionTimeout(game: Game, roomId: string): void {
    if (!game.getAwaitingDecisions()) return;

    const pendingUuids = [...game.getPendingDecisionUuids()];
    for (const uuid of pendingUuids) {
      const player =
        game.getPlayers().find((p) => p.getUuid() === uuid) ||
        game.getLostPlayers().find((p) => p.getUuid() === uuid);

      if (player && player.getIsMaster()) {
        game.changePlayerToWaiting(uuid);
      } else {
        this._kickPlayerFromRoom(uuid, game, roomId);
      }
    }

    game.getPendingDecisionUuids().clear();
    game.setAwaitingDecisions(false);
    game.setDecisionTimeoutId(null);

    if (game.isEmpty()) {
      this.games.delete(roomId);
      return;
    }

    this._server.to(roomId).emit('decision_phase_ended', { roomId });
    this._notifyRoomPlayersUpdate(game, roomId);
  }

  private _kickPlayerFromRoom(uuid: string, game: Game, roomId: string): void {
    const infos = this.UUIDMapings.get(uuid);

    const wasHost =
      game.getPlayers().find((p) => p.getUuid() === uuid)?.getIsMaster() ||
      game.getLostPlayers().find((p) => p.getUuid() === uuid)?.getIsMaster() ||
      game.getWaitingPlayers().find((p) => p.getUuid() === uuid)?.getIsMaster() ||
      false;

    game.removePlayerFromAll(uuid);

    if (wasHost) {
      this._transferHostInRoom(game, roomId);
    }

    if (infos) {
      for (const sid of infos.socketsId) {
        const socket = this._server.sockets.sockets.get(sid);
        if (socket) {
          socket.leave(roomId);
        }
      }
      const idx = infos.lobbyRoomsId.indexOf(roomId);
      if (idx !== -1) {
        infos.lobbyRoomsId.splice(idx, 1);
      }
      this._server.to(infos.socketsId).emit('kicked_from_room', { roomId });
    }
  }

  public playerDecision(uuid: string, socketId: string, roomId: string, decision: string): void {
    const game = this.games.get(roomId);
    if (!game) return;

    if (game.getAwaitingDecisions() && game.getPendingDecisionUuids().has(uuid)) {
      game.getPendingDecisionUuids().delete(uuid);

      if (decision === 'lobby') {
        game.changePlayerToWaiting(uuid);
      } else {
        this._kickPlayerFromRoom(uuid, game, roomId);
      }

      if (game.getPendingDecisionUuids().size === 0) {
        game.clearDecisionTimeout();
        game.setAwaitingDecisions(false);

        if (game.isEmpty()) {
          this.games.delete(roomId);
          return;
        }

        this._server.to(roomId).emit('decision_phase_ended', { roomId });
      }

      if (!game.isEmpty()) {
        this._notifyRoomPlayersUpdate(game, roomId);
      }
      return;
    }

    // Early decision (game still ongoing, loser deciding before game fully ends)
    if (game.getIsStarted()) {
      if (decision === 'lobby') {
        game.changePlayerToWaiting(uuid);
      } else {
        this.leaveRoom(uuid, socketId, roomId);
      }
    }
  }

  private async pageToGo(
    uuid: string,
    roomName: string,
    type: number,
    name: string,
  ): Promise<void> {
    if (type == SINGLE) {
      this._server.to(roomName).emit('pageToGo', {
        pageInfos: {
          path: roomName + '/' + name,
          name: name,
          roomName: roomName,
        },
      });
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });
    return;
  }
}
