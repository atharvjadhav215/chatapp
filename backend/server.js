import express from "express";
import cors from "cors"; // ✅ Import CORS
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url"; // ✅ Handle __dirname in ES modules
import http from "http"; // ✅ Import HTTP for WebSockets
import { Server } from "socket.io"; // ✅ Import Socket.io
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import transRoute from "./routes/transRoute.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to Database
connectDB();

// ✅ Initialize Express App
const app = express();

// ✅ Enable CORS for API & WebSockets
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// ✅ Middleware to Parse JSON Requests
app.use(express.json());

// ✅ API Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/translate", transRoute); // ✅ Translation API route

// -------------------------- Deployment ------------------------------
// ✅ Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.send("API is running..");
});

// -------------------------- Deployment ------------------------------

// ✅ Create HTTP Server for WebSockets
const server = http.createServer(app);

// ✅ Initialize Socket.io with CORS
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// ✅ WebSocket Events
io.on("connection", (socket) => {
  console.log("🟢 Connected to Socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User Joined Room: ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}...`);
});
