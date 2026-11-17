const router = require('express').Router();

// Giữ nguyên prefix cũ để frontend không phải đổi endpoint.
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/userarchievement', require('./userAchievement.routes'));
router.use('/archievement', require('./achievement.routes'));
router.use('/song', require('./song.routes'));
router.use('/songdetail', require('./songDetail.routes'));
router.use('/songartist', require('./songArtist.routes'));
router.use('/playlist', require('./playlist.routes'));
router.use('/notification', require('./notification.routes'));
router.use('/follow', require('./follow.routes'));
router.use('/comment', require('./comment.routes'));
router.use('/message', require('./message.routes'));
router.use('/like', require('./like.routes'));

module.exports = router;
