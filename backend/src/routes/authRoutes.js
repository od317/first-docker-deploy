const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Protected test route
router.get('/profile', authController.protected, (req, res) => {
  res.json({ 
    message: 'This is protected data',
    user: req.user 
  });
});

module.exports = router;