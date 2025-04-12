const express = require("express");
const router = express.Router();

const followController = require('../controllers/followsController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllFollow",authMiddleware,followController.getAllFollow);
router.get("/getCountFollower/:id",authMiddleware,followController.getCountFollower);
router.get("/getCountFollowing/:id",authMiddleware,followController.getCountFollowing);
router.get("/getAllFollower/:id",authMiddleware,followController.getAllFollower);
router.get("/getAllFollowing/:id",authMiddleware,followController.getAllFollowing);

//create
router.post("/addNewFollower/:id",authMiddleware,followController.addNewFollower);

module.exports = router;