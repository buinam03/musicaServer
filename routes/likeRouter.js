const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const { authMiddleware } = require("../service/authservice");

router.post("/toggleLike", authMiddleware, likeController.toggleLike);
router.get("/getLikeStatus", authMiddleware, likeController.getLikeStatus);
router.get("/getSongLikes", authMiddleware, likeController.getSongLikes);
router.get("/getAllSongLiked", authMiddleware, likeController.getAllSongLiked);
router.get("/getSongLikeById", authMiddleware, likeController.getSongLikeById);

module.exports = router;
