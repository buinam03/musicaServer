const express = require("express");
const router = express.Router();

const playlistController = require('../controllers/playlistController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllPlaylist",authMiddleware,playlistController.getAllPlaylist);
router.get("/getTest",authMiddleware,playlistController.getTest);

router.post("/createNewPlaylist",authMiddleware,playlistController.createNewPlaylist);
router.post("/createNewPlaylistNotName",authMiddleware,playlistController.createNewPlaylistNotName);
router.post("/addSongToPlaylist",authMiddleware,playlistController.addSongToPlaylist);

router.delete("/deletePlaylist",authMiddleware,playlistController.deletePlaylist);

module.exports = router;
