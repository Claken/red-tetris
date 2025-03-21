# !!! README IN PROGRESS !!! #

# ![red-tetris - Copy](https://github.com/user-attachments/assets/a2df82c6-00d2-4dae-9977-c5ca1f49de15)  RED TETRIS  ![red-tetris-reverse](https://github.com/user-attachments/assets/7b21961b-896d-4ada-ae8d-6a01f83c6e33)

Red Tetris is a multiplayer Tetris game designed to be played over the network. The game is built using a full-stack JavaScript stack and leverages modern technologies to ensure smooth gameplay and reliable connectivity.

## 📜 Rules

- The client-side code must be written using a functional programming paradigm.
- The server-side code must be written using an object-oriented programming paradigm.
- The application must include rigorous unit tests to ensure code quality and reliability.

## Stack

<a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> </a>
<a href="https://nestjs.com/" target="_blank" rel="noreferrer"> <img src="https://nestjs.com/img/logo-small.svg" alt="nestjs" width="40" height="40"/> </a>
<a href="https://www.docker.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original-wordmark.svg" alt="docker" width="40">

## 🚀 Usage

To launch the application, run the following command in your terminal:
```
docker compose up
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

```
npm run test -- --coverage
```

# ▶️ How to launch a game

### Solo player game

Click on the Solo Game button to start a game by yourself:<br />

![Screenshot_from_2025-03-19_12-27-34](https://github.com/user-attachments/assets/92d36be8-9502-4bd8-a0ac-de69f9a7479f)<br />

### Multiplayer game

To play a game with multiple players, you need to create a room first.<br />
Click on the "Create a room" button ; it will automatically creates a room other players can join.<br />

![Screenshot_from_2025-03-20_13-01-28](https://github.com/user-attachments/assets/35afbc4d-1413-4a67-acd8-9b741bd80e9b)
<br />
<br />
Then, you need to have at least one other player in the room to launch a multiplayer game in it.<br />
Other players need to click on the "Join a game" button, choose the room they want, click on it, then join it and wait.

![Screenshot_from_2025-03-20_12-24-31](https://github.com/user-attachments/assets/1db32a53-6e5d-452b-a6d9-49960fe6e8f8)

The player who has created the room can now launch it :<br />

![Screenshot_from_2025-03-20_13-01-58](https://github.com/user-attachments/assets/23c8856d-7998-4965-8531-60bc4b859fda)


# 🎮 How to play a game

### ⌨️ Keyboard controls

| Action | Key |
| --- | --- |
| Move piece left | left arrow |
| Move piece right | right arrow |
| Rotate piece | up arrow |
| Accelerate piece downward | down arrow |
| Drop piece instantly | spacebar |

Enjoy the game and challenge your friends to see who can achieve the highest score!
