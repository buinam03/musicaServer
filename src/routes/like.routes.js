const router = require('express').Router();
const likeController = require('../controllers/like.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/toggleLike', likeController.toggleLike);
router.get('/getLikeStatus', likeController.getLikeStatus);
router.get('/getSongLikes', likeController.getSongLikes);
router.get('/getAllSongLiked', likeController.getLikedSongs);
router.get('/getSongLikeById', likeController.getLikedSongs);

module.exports = router;
