const express = require("express");
const router = express.Router();

const songController = require('../controllers/songController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllSong/:id",authMiddleware,songController.getAllSong);
router.get("/getSongSearch",authMiddleware,songController.getSongSearch);
router.get("/getRandomSong",authMiddleware,songController.getSongRandom);
router.get("/getDESCSong",authMiddleware,songController.getDESCSong);
router.get("/getSongPlay",authMiddleware,songController.getSongPlay);
router.get("/getSimilarSongs",authMiddleware,songController.getSimilarSongs);
router.get("/getSongById/:id",authMiddleware,songController.getSongById);
//post
router.post("/addNewSong",authMiddleware,songController.addNewSong);

//update
router.put("/updateSong/:id",authMiddleware,songController.updateSongById);

//delete 
router.delete("/deleteSong/:id",authMiddleware,songController.deleteSongById);
module.exports = router;
