// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

// Import routes
const authRoutes = require("./src/routes/auth");
const gameRoutes = require("./src/routes/games");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "casino-app-secret-key-123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI ||
        "mongodb+srv://chancewiese0925:0SMJ2llJFvLdbwKV@casino-games.pzxsvqk.mongodb.net/casino-app",
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://chancewiese0925:0SMJ2llJFvLdbwKV@casino-games.pzxsvqk.mongodb.net/casino-app"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Use API routes
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

// Anything that doesn't match the above, send back the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
