const express = require("express");
const router = express.Router();

const followController = require('../controllers/followsController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllFollow",authMiddleware,followController.getAllFollow);
router.get("/getCountFollower/:id",authMiddleware,followController.getCountFollower);
router.get("/getCountFollowing/:id",authMiddleware,followController.getCountFollowing);
router.get("/getAllFollower",authMiddleware,followController.getAllFollower);
router.get("/getFollowerById/:id",authMiddleware,followController.getFollowerById);
router.get("/getAllFollowing/:id",authMiddleware,followController.getAllFollowing);

//create
router.post("/addNewFollower",authMiddleware,followController.addNewFollower);

module.exports = router;