const router = require('express').Router();
const messageController = require('../controllers/message.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/getAllMessage', messageController.getAllMessage);
router.get('/getMessage', messageController.getMessage);
router.get('/getRoomMessage/:roomId', messageController.getRoomMessage);
router.get('/getAllRoomsByUser', messageController.getAllRoomsByUser);
router.get('/getASCRoom', messageController.getASCRoom);

router.post('/sendMessage', messageController.sendMessage);

router.delete('/deleteMessage', messageController.deleteMessage);

module.exports = router;
