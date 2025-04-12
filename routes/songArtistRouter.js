const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../service/authservice");

const songArtistController = require('../controllers/songArtistController');

router.get("/getAllSongArtist",authMiddleware,songArtistController.getAllArtist);


module.exports = router;
