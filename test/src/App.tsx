import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [grid, setGrid] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [retry, setReTry] = useState(false);
  const dataRef = React.useRef({ uuid: "", roomId: "" });

  const [uuid, setUuid] = useState<string | undefined>(undefined);
  const [listRoomsAc, setListRoomsAc] = useState([]);
  const [listRoomsCreate, setListRoomsCreate] = useState([]);
  const [listOtherRooms, setListOtherRooms] = useState([]);
  const [listOthersRoomsJoined, setListOthersRoomsJoined] = useState([]);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
  });

  // const handleFormMulti = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   socket?.emit("playerPlayMulti", { name: name, uuid: uuid });
  // };

  const createRoomForm = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit("createRoom", { name: name, uuid: uuid });
  };

  const handleAlone = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
  };

  const handleForm = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form submitted");
    setName(formData.name);
    setSocket(
      io("http://localhost:3000", {
        query: { name: formData.name, uuid: uuid },
      })
    );
  };

  const startMultiGame = (room: string) => {
    console.log(room);
    socket?.emit("getWaitingList", { uuid: uuid, roomId: room });
    socket?.emit("startMultiGame", { name: name, uuid: uuid, roomId: room });
  };

  const joinGame = (room: string) => {
    console.log(room);
    socket?.emit("joinGame", { name: name, uuid: uuid, roomId: room });
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    // console.log(e.key);
    if (e.key === "ArrowRight") {
      socket?.emit("moveRight", { uuid: uuid, roomId: roomId });
    } else if (e.key === "ArrowLeft") {
      socket?.emit("moveLeft", { uuid: uuid, roomId: roomId });
    } else if (e.key === "ArrowUp") {
      socket?.emit("rotate", { uuid: uuid, roomId: roomId });
    } else if (e.key === "ArrowDown") {
      socket?.emit("moveDown", { uuid: uuid, roomId: roomId });
    } else if (e.key === " ") {
      socket?.emit("fallDown", { uuid: uuid, roomId: roomId });
    }
  };

  const createRoom = () => {
    if (name && uuid) {
      return (
        <form onSubmit={createRoomForm}>
          <button type="submit">creer une room</button>
        </form>
      );
    }
    return null;
  };

  const formAlone = () => {
    if (name && uuid) {
      return (
        <form onSubmit={handleAlone}>
          <button type="submit">Jouer seul</button>
        </form>
      );
    }
  };

  const formu = () => {
    if (uuid && name) {
      return null;
    }
    return (
      <form onSubmit={handleForm}>
        <input
          value={formData.name}
          onChange={(e) => {
            e.preventDefault();
            setFormData({ ...formData, name: e.target.value });
          }}
          placeholder="Entrez votre nom"
        />
        <button type="submit">Envoyer</button>
      </form>
    );
  };

  const lala = () => {
    // console.log("lala");
  };

  const listRoomsActive = () => {
    if (uuid && name) {
      return (
        <div>
          <p>active Rooms</p>
          {listRoomsAc.map((room, index) => {
            return (
              <div key={index}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setRoomId(() => {
                      const val = room;
                      return val;
                    });
                  }}
                >
                  revenir sur la room {room}
                </button>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const fListOthersRoomsJoined = () => {
    if (uuid && name) {
      return (
        <div>
          <p>Lists rooms joined</p>
          {listOthersRoomsJoined.map((room, index) => {
            return (
              <div key={index}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setRoomId(() => {
                      const val = room;
                      return val;
                    });
                  }}
                >
                  revenir sur la room {room}
                </button>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const listRoomsCreated = () => {
    if (uuid && name) {
      return (
        <div>
          <p>Lists rooms created</p>
          {listRoomsCreate.map((room, index) => {
            return (
              <div key={index}>
                <button
                  onClick={
                    (e) => {
                      e.preventDefault();
                      startMultiGame(room);
                    }
                    // setRoomId((prev) => {
                    //   const val = room;
                    //   return val;
                    // });/
                  }
                >
                  demarrer la game sur la room {room}
                </button>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const listOtherRoomsCreated = () => {
    if (uuid && name) {
      return (
        <div>
          <p>Lists rooms to join</p>
          {listOtherRooms.map((room, index) => {
            return (
              <div key={index}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    joinGame(room);
                    // setRoomId((prev) => {
                    //   const val = room;
                    //   return val;
                    // });
                  }}
                >
                  rejoindre la room {room}
                </button>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const gridTetris = () => {
    return (
      <div
        tabIndex={0}
        className="grid"
        onClick={lala}
        onKeyDown={handleKeydown}
      >
        {grid?.map((row: number[], index) => {
          if (index < 4) {
            return null;
          }
          return (
            <div className="line" key={index}>
              {row?.map((cell: number, index) => {
                return (
                  <div
                    className="cell"
                    key={index}
                    style={{
                      backgroundColor:
                        cell === 0
                          ? "black"
                          : cell === 1
                          ? "blue"
                          : cell === 2
                          ? "green"
                          : cell === 3
                          ? "orange"
                          : cell === 4
                          ? "yellow"
                          : cell === 5
                          ? "red"
                          : cell === 6
                          ? "purple"
                          : cell === 7
                          ? "cyan"
                          : cell === 10
                          ? "brown"
                          : cell === 20
                          ? "gray"
                          : cell === 102
                          ? "green"
                          : "white",
                    }}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const retryGame = () => {
    if (!retry) {
      return null;
    }
    return (
      <div>
        <h2>Voulez vous rejouer</h2>
        <button
          onClick={(e) => {
            e.preventDefault();
            socket?.emit("retryGame", {
              uuid: dataRef.current.uuid,
              roomId: dataRef.current.roomId,
            });
            setReTry(false);
          }}
        >
          oui
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            socket?.emit("notRetryGame", {
              uuid: dataRef.current.uuid,
              roomId: dataRef.current.roomId,
            });
            setReTry(false);
          }}
        >
          non
        </button>
      </div>
    );
  };

  useEffect(() => {
    const uuid = sessionStorage.getItem("uuid");
    const name = sessionStorage.getItem("name");
    if (uuid && name) {
      setUuid(uuid);
      setName(name);
      if (uuid && name) {
        setSocket(
          io("http://localhost:3000", {
            query: { name: name, uuid: uuid },
          })
        );
      } else {
        // console.log(`uuid or name is undefined ${uuid} ${name}`);
      }
    }
  }, []);

  useEffect(() => {
    const uuid = sessionStorage.getItem("uuid");
    if (uuid && socket) {
      socket.emit("getActiveRooms", { uuid: uuid });
      socket.emit("getCreateRooms", { uuid: uuid });
      socket.emit("getOtherRooms", { uuid: uuid });
      socket.emit("getOthersRoomsJoined", { uuid: uuid });
    }
    socket?.on("countdown", (data) => {
      // console.log("countdown");
      console.log(data);
    });
    // socket?.on("waitToPlay", (data) => {
    //   setRoomId(data.roomId);
    //   console.log(data);
    // add comment
    // });

    socket?.on("new-person", (data) => {
      // console.log(data);
      sessionStorage.setItem("uuid", data.uuid);
      sessionStorage.setItem("name", data.name);
      setUuid(data.uuid);
    });

    socket?.on("getActiveRooms", (data) => {
      console.log(data);
      // if (!data.rooms || !data.rooms.otherRoomsId || !data.rooms.ownedRoomsId) {
      //   return;
      // }
      // const rooms: any = [
      //   ...data.rooms.otherRoomsId,
      //   ...data.rooms.ownedRoomsId,
      // ];
      setListRoomsAc(data.activeRooms);
      // console.log({ rooms: rooms });
    });
  }, [socket, roomId]);

  useEffect(() => {
    socket?.on("beforeGame", (data) => {
      // console.log("beforeGame");
      // console.log(data);
      console.log("lili");
      // if (data.player.roomId === roomId) {
      setGrid(data.player.grid);
      // console.log(data.player.roomId);
      setRoomId(data.player.roomId);
      // }
      // setRoomId(data.player.roomId);
      // setGrid(data.player.grid);
    });
    return () => {
      socket?.off("beforeGame"); // Nettoyer l'écouteur 'beforeGame'
    };
  }, [grid, roomId, socket]);

  useEffect(() => {
    socket?.on("endGame", (data) => {
      // console.log(data);
      if (data.player.roomId == roomId) {
        setGrid([]);
        setRoomId("");
      }
      dataRef.current = { uuid: uuid as string, roomId: data.player.roomId };
      setReTry(true);
      // demander pour un retry de la partie.
      socket.emit("getActiveRooms", { uuid: uuid });
    });
    return () => {
      socket?.off("endGame"); // Nettoyer l'écouteur 'endGame'
    };
  }, [grid, roomId, socket, uuid]);

  useEffect(() => {
    socket?.on("myGame", (data) => {
      // console.log("myGame");
      // console.log(data);
      console.log(data.listSpectrum);
      console.log("-----------------");
      console.log({ roomId: roomId });
      console.log({ player: data.player.roomId });
      if (data.player.roomId === roomId) {
        // console.log("lala");
        // console.log(data.player.grid);
        setGrid(data.player.grid);
        // console.log(data.player.roomId);
        // setRoomId(data.player.roomId);
      }
      console.log("-----------------");
    });
    return () => {
      socket?.off("myGame"); // Nettoyer l'écouteur 'myGame'
      // Nettoyer les autres écouteurs d'événements si nécessaire
    };
  }, [roomId, socket]);

  useEffect(() => {
    socket?.on("roomCreate", () => {});
    return () => {
      socket?.off("roomCreate");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("getCreateRooms", (data) => {
      setListRoomsCreate(data.createRooms);
    });
    return () => {
      socket?.off("getCreateRooms");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("getOtherRooms", (data) => {
      setListOtherRooms(data.otherRooms);
    });
    return () => {
      socket?.off("getOtherRooms");
    };
  });

  useEffect(() => {
    socket?.on("getOthersRoomsJoined", (data) => {
      console.log(data);
      setListOthersRoomsJoined(data.roomsJoined);
    });
    return () => {
      socket?.off("getOthersRoomsJoined");
    };
  });

  useEffect(() => {
    socket?.on("pageToGo", (data) => {
      console.log(data);
    });
    return () => {
      socket?.off("pageToGo");
    };
  });

  useEffect(() => {
    socket?.on("not_enough_person", (data) => {
      console.log(data);
    });
    return () => {
      socket?.off("not_enough_person");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("list_players_room", (data) => {
      console.log(data);
    });
    return () => {
      socket?.off("list_players_room");
    };
  }, [socket]);

  return (
    <div>
      <h1>Bonjour</h1>
      {formu()}
      {createRoom()}
      {listRoomsCreated()}
      {formAlone()}
      {listRoomsActive()}
      {fListOthersRoomsJoined()}
      {listOtherRoomsCreated()}
      {gridTetris()}
      {retryGame()}

      {/* {gridTetris2()} */}
      <p>{name}</p>
      <p>{uuid}</p>
      <p>{socket?.id}</p>
    </div>
  );
}

export default App;
