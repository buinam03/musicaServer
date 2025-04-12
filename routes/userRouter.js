const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {authMiddleware} = require("../service/authservice");

router.get("/getAllUser",authMiddleware,userController.getAllUser);
router.post("/register",userController.registerAccount);
router.post("/login",userController.loginAccount);


module.exports = router;
