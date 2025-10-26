// server/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... Add placeholders for other functions to prevent errors ...

exports.getMe = (req, res) => { res.json({ user: req.user }); };
exports.registerUser = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };
exports.getUsers = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };
exports.updateUser = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };
exports.deleteUser = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };