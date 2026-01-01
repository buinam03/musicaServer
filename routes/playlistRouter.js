const express = require("express");
const router = express.Router();

const playlistController = require('../controllers/playlistController');
const { authMiddleware } = require("../service/authservice");

// GET routes
router.get("/getAllPlaylist", authMiddleware, playlistController.getAllPlaylist);
router.get("/getPlaylistById/:playlist_id", authMiddleware, playlistController.getPlaylistById);
router.get("/getPlaylistsByUserId/:user_id", authMiddleware, playlistController.getPlaylistsByUserId);
router.get("/getPlaylistCMS", authMiddleware, playlistController.getPlaylistCMS);
router.get("/getAllPlaylistCMS", authMiddleware, playlistController.getAllPlaylistCMS);
// POST routes
router.post("/createNewPlaylist", authMiddleware, playlistController.createNewPlaylist);
router.post("/createNewPlaylistNotName", authMiddleware, playlistController.createNewPlaylistNotName);
router.post("/addSongToPlaylist", authMiddleware, playlistController.addSongToPlaylist);
router.post("/createPlaylistCMS", authMiddleware, playlistController.createPlaylistCMS);
router.post("/addSongToPlaylistCMS", authMiddleware, playlistController.addSongToPlaylistCMS);

// PUT routes
router.put("/updatePlaylist/:playlist_id", authMiddleware, playlistController.updatePlaylist);

// DELETE routes
router.delete("/removeSongFromPlaylist", authMiddleware, playlistController.removeSongFromPlaylist);
router.delete("/deletePlaylist/:playlist_id", authMiddleware, playlistController.deletePlaylist);

module.exports = router;
