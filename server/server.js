const express = require("express");
const http = require("http");
const net = require("node:net");
const cors = require("cors");
const { Server } = require("socket.io");
const { YSocketIO } = require("y-socket.io/dist/server");
const axios = require("axios");
const executeCode = require("./services/executeCode.js");


const allowedOrigins = [
  "https://code-collab-chi-nine.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

const app = express();
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const ysocketio = new YSocketIO(io);
ysocketio.initialize();
console.log("[YSocketIO startup]", {
  renderCommit: process.env.RENDER_GIT_COMMIT || "unavailable",
  renderService: process.env.RENDER_SERVICE_NAME || "unavailable",
  workingDirectory: process.cwd(),
  serverEntry: __filename,
  packageEntry: require.resolve("y-socket.io/dist/server"),
  packageVersion: require("y-socket.io/package.json").version,
  constructionSucceeded: true,
  initializeSucceeded: true,
  namespaceRegistered: Boolean(ysocketio.nsp),
  namespacePattern: "/^\\/yjs\\|.*$/",
});

ysocketio.on("document-loaded", (doc) => {
  console.log(`[YSocketIO Server] Document loaded for room: "${doc.name}"`);
});

ysocketio.on("document-update", (doc, update) => {
  console.log(`[YSocketIO Server] Document update on room: "${doc.name}" (${update.length} bytes)`);
});

ysocketio.on("all-document-connections-closed", (doc) => {
  console.log(`[YSocketIO Server] All connections closed for room: "${doc.name}"`);
});

const yjsNsp = io.of(/^\/yjs\|.*$/);
yjsNsp.on("connection", (socket) => {
  console.log(`[YSocketIO Server] Client ${socket.id} connected to Yjs namespace: ${socket.nsp.name}`);
});

const userSocketMap = {};

const PORT = Number(process.env.PORT) || 5000;

function isPortTaken(port, host) {
  return new Promise((resolve) => {
    const probe = net.createServer();

    probe.once("error", (error) => {
      if (error.code === "EADDRNOTAVAIL") {
        resolve(false);
        return;
      }

      resolve(true);
    });

    probe.once("listening", () => {
      probe.close(() => resolve(false));
    });

    probe.listen(port, host);
  });
}

async function getAvailablePort(startPort = PORT) {
  let candidatePort = startPort;

  while (true) {
    const ipv4Busy = await isPortTaken(candidatePort, "127.0.0.1");
    if (!ipv4Busy) {
      const ipv6Busy = await isPortTaken(candidatePort, "::1");
      if (!ipv6Busy) {
        return candidatePort;
      }
    }

    candidatePort += 1;
  }
}

async function startServer(port = PORT) {
  const availablePort = await getAvailablePort(port);

  if (availablePort !== port) {
    console.warn(`[Server] Port ${port} is busy. Starting on port ${availablePort} instead.`);
  }

  server.listen(availablePort, "0.0.0.0", () => {
    console.log(`Server running on port ${availablePort}`);
  });
}

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

if (require.main === module) {
  startServer(PORT);
}

module.exports = {
  app,
  server,
  getAvailablePort,
  startServer,
};