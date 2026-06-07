const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const axios = require("axios");
const executeCode = require("./services/executeCode.js");


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const PORT = process.env.PORT || 5000;

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

app.post("/run", async (req, res) => {
    try {

        const { code } = req.body;

        const result = await executeCode(code);

        res.json(result);

    } catch (error) {

        console.log("Error running code:", error);

        res.status(500).json({
            stdout: "",
            stderr: "Internal Server Error",
            exitCode: 1
        });

    }
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-change", { 
            code,
        });
    });

    socket.on("sync-code", ({ socketId, code }) => {
        io.to(socketId).emit("code-change", { 
            code,
        });
    });

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

  socket.on("disconnecting", () => {
    const username = userSocketMap[socket.id] || "Unknown user";
    
    for(const roomId of socket.rooms){
        if(roomId !== socket.id){
            io.to(roomId).emit("joined", {
                clients : getAllConnectedClients(roomId).filter(client => client.socketId !== socket.id),
                socketId: socket.id,
                username,
            })
        }
    }

    delete userSocketMap[socket.id];

    console.log(`${username} disconnected:`, socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});