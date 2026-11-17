const router = require('express').Router();
const songController = require('../controllers/song.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllSong/:id', songController.getAllSong);
router.get('/getSongSearch', songController.getSongSearch);
router.get('/getSongByUser', songController.getSongByUser);
router.get('/getRandomSong', songController.getSongRandom);
router.get('/getDESCSong', songController.getDESCSong);
router.get('/getLastestSong/:id', songController.getLastestSong);
router.get('/getSongPlay', songController.getSongPlay);
router.get('/getSimilarSongs', songController.getSimilarSongs);
router.get('/getSongById/:id', songController.getSongById);
router.get('/getMostListenTrack/:id', songController.getMostListenTrack);
router.get('/getSongByDescPlays', songController.getSongByDescPlays);

router.post('/addNewSong', songController.addNewSong);
router.post('/logUser', songController.logUser);

router.put('/updateSong/:id', songController.updateSongById);

router.delete('/deleteSongById/:id', songController.deleteSongById);

module.exports = router;
