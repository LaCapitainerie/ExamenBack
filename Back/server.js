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
const dimensions = {width: 800, height: 500};

function newColor() { return `hsl(${Math.floor(Math.random() * 360)}, 60%, 50%)`; }

io.on("connection", (socket) => {

  socket.on("request_players", () => {
    socket.emit("update_leaderboard", players);
  });

  socket.on("set_name", (name) => {
    players[socket.id] = {name: name, score: 30, x: Math.random() * dimensions.width, y: Math.random() * dimensions.height, color: newColor()};
    console.log(`${name} (${socket.id}) s'est connecté`);

    io.emit("update_leaderboard", players);
  });

  socket.on("disconnect", () => {

    if(!players[socket.id]) {
      return;
    }

    console.log(`Le joueur ${players[socket.id]} (${socket.id}) s'est déconnecté`);

    delete players[socket.id];

    io.emit("update_leaderboard", players);
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log("Le serveur écoute sur http://localhost:3001");
});
