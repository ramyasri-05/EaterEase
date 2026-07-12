const express = require('express');
const router = express.Router();
const { registerUser, authUser, updateProfilePhoto } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.put('/profile/photo', protect, updateProfilePhoto);

module.exports = router;
