const express = require("express");
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllNotification",authMiddleware,notificationController.getAllNotification);


module.exports = router;