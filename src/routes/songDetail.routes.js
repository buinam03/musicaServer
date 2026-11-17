const router = require('express').Router();
const songDetailController = require('../controllers/songDetail.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllSongDetail', songDetailController.getAllSongDetail);
router.get('/getGenre', songDetailController.getGenre);

router.put('/updatePlayWhenListenSong/:id', songDetailController.updatePlayWhenListenSong);
router.put('/updateLikeWhenLikeSong/:id', songDetailController.updateLikeWhenLikeSong);

module.exports = router;
