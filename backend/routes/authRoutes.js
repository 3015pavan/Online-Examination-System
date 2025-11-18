const express = require('express');
const {
  register,
  login,
  refreshToken,
  getCurrentUser,
  logout,
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validators');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);

module.exports = router;
