const express = require("express");
const router = express.Router();

const followController = require('../controllers/followsController');
const { authMiddleware } = require("../service/authservice");

router.get("/getAllFollow",authMiddleware,followController.getAllFollow);
router.get("/getCountFollower",authMiddleware,followController.getCountFollower);
router.get("/getCountFollowing",authMiddleware,followController.getCountFollowing);
router.get("/getAllFollower",authMiddleware,followController.getAllFollower);
router.get("/getFollowerById/:id",authMiddleware,followController.getFollowerById);
router.get("/getAllFollowing",authMiddleware,followController.getAllFollowing);
router.get("/searchFollowers",authMiddleware,followController.searchFollowers);
router.get("/searchFollowing",authMiddleware,followController.searchFollowing);
router.get("/getFollowStatus",authMiddleware,followController.getFollowStatus);
//create
router.post("/addNewFollower",authMiddleware,followController.addNewFollower);

module.exports = router;