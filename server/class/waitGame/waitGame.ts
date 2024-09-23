import { Game } from '../game/game';
import { IdentifierToSocket } from '../../interfaces/identifierToSocket';

export class WaitGame {
  private static _instance: WaitGame;
  private games: Map<string, Game> = new Map();
  private identifierToSockets: Map<IdentifierToSocket, string[]> = new Map();
  private constructor() {}
  public static getInstance(): WaitGame {
    if (!WaitGame._instance) {
      WaitGame._instance = new WaitGame();
    }
    return WaitGame._instance;
  }
}
