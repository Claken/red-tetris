import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [uuid, setUuid] = useState<string | undefined>(undefined);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleFormMulti = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit("playerPlayMulti", { name: name, uuid: uuid });
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

  socket?.on("countdown", (data) => {
    console.log(data);
  });

  socket?.on("startGame", (data) => {
    console.log(data);
  });

  socket?.on("game", (data) => {
    console.log(data);
  });

  socket?.on("waitToPlay", (data) => {
    console.log(data);
  });

  socket?.on("new-person", (data) => {
    console.log(data);
    sessionStorage.setItem("uuid", data.uuid);
    sessionStorage.setItem("name", data.name);
    setUuid(data.uuid);
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

  return (
    <div>
      <h1>Bonjour</h1>
      {formu()}
      {formuMulti()}
      <p>{name}</p>
      <p>{uuid}</p>
      <p>{socket?.id}</p>
    </div>
  );
}

export default App;
