# !!! README IN PROGRESS !!! #

# ![red-tetris - Copy](https://github.com/user-attachments/assets/a2df82c6-00d2-4dae-9977-c5ca1f49de15)  RED TETRIS  ![red-tetris-reverse](https://github.com/user-attachments/assets/7b21961b-896d-4ada-ae8d-6a01f83c6e33)


The goal of this project is to develop a multiplayer Tetris game over the network using exclusively a Full Stack JavaScript stack

## 📜 Rules

- The client-side code must be written using a functional programming paradigm.
- The server-side code must be written using an object-oriented programming paradigm.
- The application must include rigorous unit tests to ensure code quality and reliability.

## Stack

<a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> </a>
<a href="https://nestjs.com/" target="_blank" rel="noreferrer"> <img src="https://nestjs.com/img/logo-small.svg" alt="nestjs" width="40" height="40"/> </a>
<a href="https://www.docker.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original-wordmark.svg" alt="docker" width="40">

## 🚀 Usage

Type this command in your terminal :
```
docker compose up
```
This will install all the pre-requisites and launch the back and the front ends of the project <br />
<br />
Once everything is launched, type this URL in your browser :
```
http://localhost:5173/
```
Then, you will need to write a name :<br />
![Screenshot_from_2025-03-19_12-51-34](https://github.com/user-attachments/assets/7ca76121-0dea-44b8-9a13-32cf94ea1494)<br />
<br />
Once this is done, this page will appear :<br />
![Screenshot_from_2025-03-19_12-29-53](https://github.com/user-attachments/assets/468091af-14bf-4beb-b312-0720a8b9cef5)

### Coverage

```
npm run test -- --coverage
```

# ▶️ How to launch a game

### Solo player game

Click on the "solo game" button to start a game on your own.<br />
You will have something like this :<br />
![Screenshot_from_2025-03-19_12-27-34](https://github.com/user-attachments/assets/92d36be8-9502-4bd8-a0ac-de69f9a7479f)<br />

### Multiplayer game

To play a game with multiple players, you need to create a room first.<br />
Click on the "Create a room" button ; it will automatically creates a room other players can join.<br />
![Screenshot_from_2025-03-20_11-50-49](https://github.com/user-attachments/assets/03941050-5a1c-4216-a920-876a34710542)
<br />
<br />
Then, you need to have at least one other player to launch a multiplayer game.

# 🎮 How to play a game

### ⌨️ Keyboard controls

| Action | Key |
| --- | --- |
| move piece to the left | left arrow |
| move piece to the right | right arrow |
| rotate piece | up arrow |
| piece falls towards the pile | down arrow |
| Vertically move piece on the pile | spacebar |
