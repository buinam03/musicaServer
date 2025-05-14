const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController");
const { authMiddleware } = require("../service/authservice");

router.get("/getAllAchievement",authMiddleware,achievementController.getAllAchievement);

module.exports = router;
