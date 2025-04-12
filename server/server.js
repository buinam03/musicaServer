require ("dotenv").config();

const {conn} = require('../config/db');
const cors = require("cors");
const express = require("express");


//userRoute
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
const archievementRoute = require('../routes/archievementRouter');
const authRoute = require('../routes/authRouter');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

conn();

app.use("/api/users", userRoute);
app.use("/api/userarchievement", userArchievementRoute);
app.use("/api/song",songRoute);
app.use("/api/songdetail",songDetailRoute);
app.use("/api/songartist",songArtistRoute);
app.use("/api/playlist",playlistRoute);
app.use("/api/notification",notificationRoute);
app.use("/api/follow",followsRoute);
app.use("/api/comment",commentRoute);
app.use("/api/archievement",archievementRoute);
app.use("/api/message",messageRoute);
app.use("/api/auth",authRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
