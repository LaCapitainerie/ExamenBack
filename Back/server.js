const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

const players = {};
const dimensions = { width: 1200, height: 1000 };
const foods = [];
const foodCount = 100;
const speed = 10;
const foodScore = 1;

function newColor() { return `hsl(${Math.floor(Math.random() * 360)}, 60%, 50%)`; }

function generateFood() {
  for (let i = 0; i < foodCount; i++) {
    foods.push({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      color: newColor(),
    });
  }
}

io.on("connection", (socket) => {

  socket.on("request_players", () => {
    socket.emit("update_leaderboard", players);
  });

  socket.on("request_food", () => {
    socket.emit("update_food", foods);
  });

  socket.on("set_name", (name) => {
    players[socket.id] = {
      name: name,
      score: 30,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      color: newColor(),

      direction: Math.random() * 360,
    };
    console.log(`${name} (${socket.id}) s'est connecté`);

    io.emit("update_leaderboard", players);
    io.emit("update_food", foods);
  });

  socket.on("disconnect", () => {

    if (!players[socket.id]) {
      return;
    }

    console.log(`Le joueur ${players[socket.id]} (${socket.id}) s'est déconnecté`);

    delete players[socket.id];

    io.emit("update_leaderboard", players);
  });

  socket.emit("initialize_food", foods);

  socket.on("eat_food", (foodIndex) => {
    if (foods[foodIndex]) {

    }
  });

  socket.on("update_direction", (direction) => {
    if (players[socket.id]) {
      players[socket.id].direction = direction;
    }
  });

  setInterval(() => {
    for (let id in players) {
      if (players[id].direction) {

        const moveX = Math.cos(players[id].direction) * (speed / players[id].score);
        const moveY = Math.sin(players[id].direction) * (speed / players[id].score);

        if (players[id].x + moveX > 0 && players[id].x + moveX < dimensions.width) {
          players[id].x += moveX;
        }

        if (players[id].y + moveY > 0 && players[id].y + moveY < dimensions.height) {
          players[id].y += moveY;
        }

        for (let foodIndex in foods) {
          if (
            Math.abs(players[id].x - foods[foodIndex].x) < players[id].score &&
            Math.abs(players[id].y - foods[foodIndex].y) < players[id].score
          ) {

            foods.splice(foodIndex, 1);
            players[id].score += foodScore;
            io.emit("update_leaderboard", players);

            let food = {}

            do {
              var collision = false;
              food = {
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                color: newColor(),
              };

              for (let playerId in players) {
                if (
                  Math.abs(players[playerId].x - foods[foods.length - 1].x) < players[playerId].score &&
                  Math.abs(players[playerId].y - foods[foods.length - 1].y) < players[playerId].score
                ) {
                  collision = true;
                  break;
                }
              }
            } while (collision);

            foods.push(food);
            io.emit("update_food", foods);
          }
        }
      }
    }

    io.emit("update_players", players);
  }, 200);

});




generateFood();

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log("Le serveur écoute sur http://localhost:3001");
});
