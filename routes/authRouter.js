const express = require("express");
const router = express.Router();
const {authMidleware,refreshAccessToken} = require("../service/authservice");

router.post('/refresh-token',refreshAccessToken);

module.exports = router;
