require("dotenv").config();

const { conn } = require('../config/db');
const cors = require("cors");
const express = require("express");
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Import routes
const userRoute = require("../routes/userRouter");
const userArchievementRoute = require("../routes/userArchievementRouter");
const songRoute = require('../routes/songRouter');
const songDetailRoute = require('../routes/songDetailRouter');
const songArtistRoute = require('../routes/songArtistRouter');
const playlistRoute = require('../routes/playlistRouter');
const notificationRoute = require('../routes/notificationRouter');
const followsRoute = require('../routes/followsRouter');
const commentRoute = require('../routes/commentRouter');
const messageRoute = require('../routes/messageRouter');
const archievementRoute = require('../routes/achievementRouter');
const authRoute = require('../routes/authRouter');
const likeRoute = require('../routes/likeRouter');

// Import models
const { Message } = require('../models/relationships');
const { User } = require('../models/relationships'); // Cần import User model

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.static("public"));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));

// Connect database
conn();

// Routes
app.use("/api/users", userRoute);
app.use("/api/userarchievement", userArchievementRoute);
app.use("/api/song", songRoute);
app.use("/api/songdetail", songDetailRoute);
app.use("/api/songartist", songArtistRoute);
app.use("/api/playlist", playlistRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/follow", followsRoute);
app.use("/api/comment", commentRoute);
app.use("/api/archievement", archievementRoute);
app.use("/api/message", messageRoute);
app.use("/api/auth", authRoute);
app.use("/api/like", likeRoute);

// Socket.io - Real-time messaging
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join room
  socket.on('room', (roomId) => {
    socket.join(roomId);
    console.log(`🚪 Socket ${socket.id} joined room: ${roomId}`);
  });

  // Send message
  socket.on("send", async (data) => {
    console.log('📨 Received send event:', data);
    
    try {
      // Validate data
      if (!data.senderId || !data.receiverId || !data.room || !data.msg) {
        throw new Error('Missing required fields');
      }

      // Save message to database
      const newMessage = await Message.create({
        send_id: data.senderId,
        receive_id: data.receiverId,
        room_id: data.room,
        message: data.msg
      });

      console.log('💾 Message saved to DB:', newMessage.id);

      // Get sender info (with profile picture)
      const sender = await User.findByPk(data.senderId, {
        attributes: ['id', 'username', 'profile_picture']
      });

      if (!sender) {
        throw new Error('Sender not found');
      }

      // Create message payload with proper structure
      const messagePayload = {
        id: newMessage.id,
        sender: {
          id: sender.id,
          username: sender.username,
          profile_picture: sender.profile_picture
        },
        message: newMessage.message,
        room_id: newMessage.room_id,
        created_at: newMessage.created_at
      };

      // Emit to ALL users in the room (including sender)
      io.to(data.room).emit('receive', messagePayload);
      
      console.log('✅ Message broadcasted to room:', data.room);
      
    } catch (error) {
      console.error('❌ Error in send event:', error);
      
      // Send error back to sender only
      socket.emit('messageError', {
        error: 'Không thể gửi tin nhắn',
        details: error.message
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔌 Socket.IO is ready`);
});