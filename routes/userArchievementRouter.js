const express = require("express");
const router = express.Router();
const userArchievementController = require('../controllers/userArchievementController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllUserArchievement",authMiddleware,userArchievementController.getAllUserArchievement);

//Post
router.post("/savedAchievementByUser",authMiddleware,userArchievementController.savedAchievementByUser);
module.exports = router;
