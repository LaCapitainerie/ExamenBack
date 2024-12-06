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
const dimensions = {width: 1200, height: 1000};
const foods = [];
const foodCount = 100;

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
    players[socket.id] = {name: name, score: 30, x: Math.random() * dimensions.width, y: Math.random() * dimensions.height, color: newColor()};
    console.log(`${name} (${socket.id}) s'est connecté`);

    io.emit("update_leaderboard", players);
    io.emit("update_food", foods);
  });

  socket.on("disconnect", () => {

    if(!players[socket.id]) {
      return;
    }

    console.log(`Le joueur ${players[socket.id]} (${socket.id}) s'est déconnecté`);

    delete players[socket.id];

    io.emit("update_leaderboard", players);
  });

  socket.emit("initialize_food", foods);

  socket.on("eat_food", (foodIndex) => {
    if (foods[foodIndex]) {
      foods.splice(foodIndex, 1);
      if (players[socket.id]) {
        players[socket.id].score += 5;
        io.emit("update_leaderboard", players);
      }
      setTimeout(() => {
        if (foods.length < 100) {
          foods.push({
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            color: newColor(),
          });
          io.emit("update_food", foods);
        }
      }, 2000);
    }
  });
});




generateFood();

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log("Le serveur écoute sur http://localhost:3001");
});
