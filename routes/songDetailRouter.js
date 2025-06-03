const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../service/authservice");

const songDetailController = require('../controllers/songDetailController');

router.get("/getAllSongDetail",authMiddleware,songDetailController.getAllSongDetail);
router.get("/getGenre",authMiddleware,songDetailController.getGenre);
//update
router.put("/updatePlayWhenListenSong/:id",authMiddleware,songDetailController.updatePlayWhenListenSong);
router.put("/updateLikeWhenLikeSong/:id",authMiddleware,songDetailController.updateLikeWhenLikeSong);
module.exports = router;
