const router = require('express').Router();
const followController = require('../controllers/follow.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllFollow', followController.getAllFollow);
router.get('/getCountFollower', followController.getCountFollower);
router.get('/getCountFollowing', followController.getCountFollowing);
router.get('/getAllFollower', followController.getAllFollower);
router.get('/getFollowerById/:id', followController.getFollowerById);
router.get('/getAllFollowing', followController.getAllFollowing);
router.get('/searchFollowers', followController.searchFollowers);
router.get('/searchFollowing', followController.searchFollowing);
router.get('/getFollowStatus', followController.getFollowStatus);

router.post('/addNewFollower', followController.addNewFollower);

module.exports = router;
