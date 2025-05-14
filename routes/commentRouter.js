const express = require("express");
const router = express.Router();

const commentController = require('../controllers/commentController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllComment/:id",authMiddleware,commentController.getAllComment);
//Post
router.post("/addNewCommentToSong/:id",authMiddleware,commentController.addNewCommentToSong);

module.exports = router;
