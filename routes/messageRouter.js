const express = require("express");
const router = express.Router();

const messageController = require('../controllers/messageController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllMessage",authMiddleware,messageController.getAllMessage);
router.get("/getMessage",authMiddleware,messageController.getMessage);
router.get("/getRoomMessage/:roomId",authMiddleware,messageController.getRoomMessage);
router.get("/getAllRoomsByUser",authMiddleware,messageController.getAllRoomsByUser);
router.get("/getASCRoom",authMiddleware,messageController.getASCRoom);

router.post("/sendMessage",authMiddleware,messageController.sendMessage);

router.delete("/deleteMessage",authMiddleware,messageController.deleteMessage);


module.exports = router;
