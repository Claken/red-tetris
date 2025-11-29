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

<img width="703" height="348" alt="Screenshot_from_2025-11-29_15-39-41" src="https://github.com/user-attachments/assets/61e2740d-4a31-41bb-85a2-6d79fff62451" /><br />
<br />
Upon entering your name, the main game screen will be displayed:<br />

<img width="1856" height="838" alt="Screenshot_from_2025-11-29_15-40-28" src="https://github.com/user-attachments/assets/6fe6eda0-126e-4ed2-a1d8-4ac10438e6f6" />

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

<img width="1856" height="838" alt="Screenshot_from_2025-11-29_15-41-42" src="https://github.com/user-attachments/assets/beb8b850-2f55-43e7-a66c-f56d87e86d1b" />

2. Wait for other players to join.<br />

To join an existing game, click on the `Join a game` button and select a room:<br />

![Screenshot_from_2025-03-20_12-24-31](https://github.com/user-attachments/assets/1db32a53-6e5d-452b-a6d9-49960fe6e8f8)

3. The room creator can launch the game once at least one other player has joined.<br />

Click on the `ALL MY ROOMS` button and select the room to want to launch:<br />

![Screenshot_from_2025-03-20_13-01-58](https://github.com/user-attachments/assets/23c8856d-7998-4965-8531-60bc4b859fda)

Here is an example of a multiplayer game with two players:<br />

<img width="1840" height="802" alt="Screenshot_from_2025-11-29_16-16-07" src="https://github.com/user-attachments/assets/8eaf01e5-9988-4216-b4c4-5d10da191004" />

<img width="1840" height="802" alt="Screenshot_from_2025-11-29_16-16-15" src="https://github.com/user-attachments/assets/accb4606-7b6a-4133-b016-f7bbecc246f1" />


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
