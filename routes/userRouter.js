const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {authMiddleware} = require("../service/authservice");

router.get("/getAllUser",authMiddleware,userController.getAllUser);
router.get("/getCurrentUser",authMiddleware,userController.getCurrentUser);
router.get("/getUserById/:id",authMiddleware,userController.getUserById);
router.get("/getRandomUser/",authMiddleware,userController.getRandomUser);
router.get("/getProvince",authMiddleware,userController.getProvince);

router.put("/updateProfilePicture",authMiddleware,userController.updateProfilePicture);
router.put("/updateHeaderPicture",authMiddleware,userController.updateHeaderPicture);
router.put("/updateUserInfo",authMiddleware,userController.updateUserInfo);

router.post("/register",userController.registerAccount);
router.post("/login",userController.loginAccount);


module.exports = router;
