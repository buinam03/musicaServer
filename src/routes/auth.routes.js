const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/refresh-token', authController.refreshToken);

module.exports = router;
