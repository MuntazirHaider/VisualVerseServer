import { Server } from "socket.io";
import express from "express";
import { createServer } from 'node:http';
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import chatRoutes from "./routes/chats.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js"
import { ChatsSocketHandler } from "./sockets/ChatSockets.js";

dotenv.config();
const app = express();
const server = createServer(app);
app.use(express.json()); // Use Express's built-in body parser
app.use(helmet()); // Security headers
app.use(morgan("common")); // Logging
app.use(cors());


/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 6001;
const CLIENT_PORT = process.env.CLIENT_PORT || 3002;

/* MONGOOSE SETUP */
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("Connected to MongoDB 🍃") })
  .catch((error) => { console.log(`Unable to connect 💀 ${error}`); })


/* WEB SOCKET SETUP */
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: `http://localhost:${CLIENT_PORT}`,
  }
});

const onConnection = (socket) => {
  console.log("connect user", socket.id);
  ChatsSocketHandler(io, socket);
}

io.on("connection", onConnection);


server.listen(PORT, () => console.log(`Server is running 🚀 on PORT: ${PORT}`));