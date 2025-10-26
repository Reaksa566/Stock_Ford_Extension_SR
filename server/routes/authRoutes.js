// server/routes/authRoutes.js
const express = require('express');
const {
  loginUser,
  getMe,
  registerUser,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public route
router.post('/login', loginUser);

// Private routes (Requires Authentication)
router.get('/me', protect, getMe);

// Admin-only routes (Requires Admin role)
router.post('/register', protect, admin, registerUser); // Create User
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;