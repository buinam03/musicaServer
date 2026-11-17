const router = require('express').Router();
const achievementController = require('../controllers/achievement.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllAchievement', achievementController.getAllAchievement);
router.post('/createAchievement', achievementController.createAchievement);

module.exports = router;
