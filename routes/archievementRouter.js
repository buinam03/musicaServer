const express = require("express");
const router = express.Router();
const archievementController = require("../controllers/archievementController");

router.get("/getAllArchievement",archievementController.getAllArchievement);

module.exports = router;
