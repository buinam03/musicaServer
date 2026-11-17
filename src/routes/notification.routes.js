const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllNotification', notificationController.getAllNotification);

module.exports = router;
