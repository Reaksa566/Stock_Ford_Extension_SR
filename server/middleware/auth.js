// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc Middleware to protect routes by checking for a valid JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format: 'Bearer TOKEN')
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (without password)
      // Note: We use the 'id' stored in the token payload
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      // Token is not valid, expired, or signature is wrong
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    // No token provided in the request
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc Middleware to restrict access to Admin role only
 */
exports.admin = (req, res, next) => {
  // Check if user exists (from protect middleware) and has the 'Admin' role
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    // 403 Forbidden: User is authenticated but does not have permission
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};