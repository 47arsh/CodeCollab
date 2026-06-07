const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");


const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("CodeCollab Server Running");
});

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || [])
  .map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId] || "Unknown user"
    };
  });
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join" , ({roomId, username}) => {
    userSocketMap[socket.id] = username;

    socket.join(roomId);

    console.log(`${username} joined room: ${roomId}`);
    
    io.to(roomId).emit("joined", {
      clients: getAllConnectedClients(roomId),  
      socketId: socket.id,
      username,
    });
  });

  socket.on("disconnect", () => {
    const username = userSocketMap[socket.id] || "Unknown user";
    console.log("Client disconnected:", socket.id, "Username:", username);
    delete userSocketMap[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});