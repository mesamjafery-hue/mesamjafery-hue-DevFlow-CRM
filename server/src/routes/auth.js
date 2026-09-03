const express = require('express');
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const { refreshTokenMiddleware } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { authMiddleware } = require('../middleware/auth');
const { requestCode, verifyCode, verifyLoginCode } = require('../controllers/twoFactorController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', rateLimit({ max: 10, message: 'Too many login attempts. Please try again later.' }), login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', rateLimit({ max: 5, message: 'Too many password reset requests. Please try again later.' }), forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshTokenMiddleware);
router.post('/2fa/request', authMiddleware, requestCode);
router.post('/2fa/verify', authMiddleware, verifyCode);
router.post('/2fa/login-verify', rateLimit({ max: 10 }), verifyLoginCode);

module.exports = router;
