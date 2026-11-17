const router = require('express').Router();
const songArtistController = require('../controllers/songArtist.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllSongArtist', songArtistController.getAllSongArtist);

module.exports = router;
