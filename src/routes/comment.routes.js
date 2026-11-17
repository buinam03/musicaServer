const router = require('express').Router();
const commentController = require('../controllers/comment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllComment/:id', commentController.getAllComment);
router.post('/addNewCommentToSong/:id', commentController.addNewCommentToSong);

module.exports = router;
