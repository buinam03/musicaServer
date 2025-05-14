require("dotenv").config();

const { conn } = require('../config/db');
const cors = require("cors");
const express = require("express");
const http = require('http');
const { Server } = require('socket.io');

// Khởi tạo app trước khi sử dụng
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Các route imports
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

//model Message
const {Message} = require('../models/relationships');
// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.static("public"));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));

// Kết nối database
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

// Socket.io logic
io.on('connection', async (socket) => {
  console.log('a user connected : ', socket.id);

  // Tham gia phòng chat
  socket.on('room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Gửi tin nhắn
  socket.on("send", async (data) => {
    console.log(data);
    try {

      // 1. Lưu tin nhắn vào database
      const newMessage = await Message.create({
        send_id: data.senderId,    // ID người gửi (client cần gửi lên)
        receive_id: data.receiverId, // ID người nhận
        room_id: data.room,
        message: data.msg
      });

      // Gửi lại cho chính người gửi (để hiển thị ngay lập tức)
      socket.emit('receive', {
        id: newMessage.id,         // ID tin nhắn từ database
        senderId: data.senderId,
        message: data.msg,
        room_id: data.room,
        createdAt: newMessage.created_at
      });

      // Gửi cho các user khác trong phòng
      socket.to(data.room).emit('receive', {
        id: newMessage.id,
        senderId: data.senderId,
        message: data.msg,
        room_id: data.room,
        createdAt: newMessage.created_at
      });
    } catch (error) {
      console.error('Lỗi khi lưu tin nhắn:', error);
      // Gửi thông báo lỗi về client
      socket.emit('messageError', {
        error: 'Không thể gửi tin nhắn',
        details: error.message
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

// Lưu ý: Sử dụng server.listen thay vì app.listen
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));