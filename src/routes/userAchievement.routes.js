const router = require('express').Router();
const achievementController = require('../controllers/achievement.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllUserArchievement', achievementController.getAllUserArchievement);
router.post('/savedAchievementByUser', achievementController.savedAchievementByUser);

module.exports = router;
