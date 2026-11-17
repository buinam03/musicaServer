const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected
router.get('/getAllUser', authMiddleware, userController.getAllUser);
router.get('/getCurrentUser', authMiddleware, userController.getCurrentUser);
router.get('/getUserById/:id', authMiddleware, userController.getUserById);
router.get('/getRandomUser', authMiddleware, userController.getRandomUser);
router.get('/getProvince', authMiddleware, userController.getProvince);

router.put('/updateProfilePicture', authMiddleware, userController.updateProfilePicture);
router.put('/updateHeaderPicture', authMiddleware, userController.updateHeaderPicture);
router.put('/updateUserInfo', authMiddleware, userController.updateUserInfo);

module.exports = router;
