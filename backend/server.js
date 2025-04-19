// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");

// Import routes
const authRoutes = require("./src/routes/auth");
const gameRoutes = require("./src/routes/games");

// No need for dotenv since we're hardcoding values
// dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080", // This must match your frontend URL exactly
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up sessions with hardcoded values
app.use(
  session({
    secret: "casino-app-secret-key-123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://chancewiese0925:0SMJ2llJFvLdbwKV@casino-games.pzxsvqk.mongodb.net/casino-app",
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Connect to MongoDB with hardcoded URI
mongoose
  .connect(
    "mongodb+srv://chancewiese0925:0SMJ2llJFvLdbwKV@casino-games.pzxsvqk.mongodb.net/casino-app"
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB Atlas", err));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Socket.io connection for real-time game updates
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a game room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle poker game events
  socket.on("pokerAction", (data) => {
    // Broadcast the updated game to all clients except the sender
    socket.to(data.roomId).emit("pokerUpdate", data.game);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server with hardcoded port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
