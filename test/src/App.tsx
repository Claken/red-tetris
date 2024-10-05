import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [grid, setGrid] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [uuid, setUuid] = useState<string | undefined>(undefined);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleFormMulti = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit("playerPlayMulti", { name: name, uuid: uuid });
  };

  const handleAlone = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
  };

  const handleForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    setName(formData.name);
    setSocket(
      io("http://localhost:3000", {
        query: { name: formData.name, uuid: uuid },
      })
    );
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    console.log(e.key);
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

  const formuMulti = () => {
    if (name && uuid) {
      return (
        <form onSubmit={handleFormMulti}>
          <button type="submit">Rejoindre une partie</button>
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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Entrez votre nom"
        />
        <button type="submit">Envoyer</button>
      </form>
    );
  };

  const lala = () => {
    console.log("lala");
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
                          : cell === 3
                          ? "red"
                          : cell === 2
                          ? "blue"
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

  socket?.on("countdown", (data) => {
    console.log("countdown");
    console.log(data);
  });

  socket?.on("beforeGame", (data) => {
    console.log("beforeGame");
    console.log(data);
    setGrid(data.player.grid);
  });

  socket?.on("myGame", (data) => {
    console.log("myGame");
    console.log(data);
    setGrid(data.player.grid);
    setRoomId(data.player.roomId);
  });

  // socket?.on("waitToPlay", (data) => {
  //   setRoomId(data.roomId);
  //   console.log(data);
  // });

  socket?.on("new-person", (data) => {
    console.log(data);
    sessionStorage.setItem("uuid", data.uuid);
    sessionStorage.setItem("name", data.name);
    setUuid(data.uuid);
  });

  socket?.on("endGame", (data) => {
    console.log(data);
    setGrid([]);
  });

  socket?.on("getRooms", (data) => {
    console.log(data);
  });

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
        console.log(`uuid or name is undefined ${uuid} ${name}`);
      }
    }
  }, []);

  useEffect(() => {
    const uuid = sessionStorage.getItem("uuid");
    if (uuid && socket) {
      socket.emit("getRooms", { uuid: uuid });
    }
  }, [socket]);

  return (
    <div>
      <h1>Bonjour</h1>
      {formu()}
      {formuMulti()}
      {formAlone()}
      {gridTetris()}
      {/* {gridTetris2()} */}
      <p>{name}</p>
      <p>{uuid}</p>
      <p>{socket?.id}</p>
    </div>
  );
}

export default App;
