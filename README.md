# ![red-tetris - Copy](https://github.com/user-attachments/assets/a2df82c6-00d2-4dae-9977-c5ca1f49de15)  RED TETRIS  ![red-tetris-reverse](https://github.com/user-attachments/assets/7b21961b-896d-4ada-ae8d-6a01f83c6e33)

Red Tetris is a multiplayer Tetris game designed to be played over the network.<br />
The game is built using a full-stack TypeScript stack and leverages modern technologies to ensure smooth gameplay and reliable connectivity.

## 📜 Rules and Guidelines

- The client-side code is written using a functional programming paradigm to maintain modularity and scalability.
- The server-side code is built using an object-oriented programming paradigm for robust and maintainable architecture.
- Comprehensive unit testing is implemented to ensure code quality and reliability.

## 🛠️ Tech Stack

| Icon | Description                                |
|-----------|--------------------------------------------|
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="35" height="35"/> | **React** for the client-side UI |
| <img src="https://nestjs.com/img/logo-small.svg" alt="nestjs" width="35" height="35"/> | **NestJS** for the server-side architecture |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original-wordmark.svg" alt="docker" width="35" height="35"/> | **Docker** for containerization and environment consistency |

## 🚀 Getting Started

To launch the application, run the following command in your terminal:
```
docker-compose up --build
```
This command will automatically install all prerequisites and launch both the front-end and back-end services.<br />
<br />
Once the application is up and running, open your browser and navigate to:
```
http://localhost:5173/
```
You will be prompted to enter a player name:<br />

![Screenshot_from_2025-03-19_12-51-34](https://github.com/user-attachments/assets/7ca76121-0dea-44b8-9a13-32cf94ea1494)<br />
<br />
Upon entering your name, the main game screen will be displayed:<br />

![Screenshot_from_2025-03-19_12-29-53](https://github.com/user-attachments/assets/468091af-14bf-4beb-b312-0720a8b9cef5)

### 🧪 Running Tests
To run tests with coverage, use the following command:
```
npm run test -- --coverage
```

# ▶️ Starting a Game

### Solo player game

Click on the `Solo game` button to start a game by yourself:<br />

![Screenshot_from_2025-03-19_12-27-34](https://github.com/user-attachments/assets/92d36be8-9502-4bd8-a0ac-de69f9a7479f)<br />

### Multiplayer game

To create a multiplayer game:
1. Click on the `Create a room` button to set up a new room.<br />

![Screenshot_from_2025-03-20_13-01-28](https://github.com/user-attachments/assets/35afbc4d-1413-4a67-acd8-9b741bd80e9b)

2. Wait for other players to join.<br />

To join an existing game, click on the `Join a game` button and select a room:<br />

![Screenshot_from_2025-03-20_12-24-31](https://github.com/user-attachments/assets/1db32a53-6e5d-452b-a6d9-49960fe6e8f8)

3. The room creator can launch the game once at least one other player has joined.<br />

Click on the `ALL MY ROOMS` button and select the room to want to launch:<br />

![Screenshot_from_2025-03-20_13-01-58](https://github.com/user-attachments/assets/23c8856d-7998-4965-8531-60bc4b859fda)

Here is an example of a multiplayer game with two players:<br />

![Screenshot_from_2025-03-22_16-30-58](https://github.com/user-attachments/assets/34410c84-d43f-415f-ae9b-11aa90bd0f3e)

![Screenshot_from_2025-03-22_16-30-58-2](https://github.com/user-attachments/assets/e12ceb11-9cb1-4774-a7d2-8778f4de50a9)

# 🎮 How to Play

### ⌨️ Controls

| Action | Key |
| --- | --- |
| Move piece left | left arrow |
| Move piece right | right arrow |
| Rotate piece | up arrow |
| Accelerate piece downward | down arrow |
| Drop piece instantly | spacebar |

Enjoy the game and challenge your friends to see who will be the last one standing !
