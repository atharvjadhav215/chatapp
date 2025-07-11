import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import transRoute from "./routes/transRoute.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Enable CORS for frontend (adjust the origin if your Vercel frontend URL is different)
app.use(
  cors({
    origin: "https://your-vercel-frontend-url.vercel.app", // Replace this with your Vercel URL
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/translate", transRoute);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chatapp-frontend-eight-ecru.vercel.app/", // Replace with your frontend URL
    credentials: true,
  },
});

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("🟢 Connected to Socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}...`);
});
