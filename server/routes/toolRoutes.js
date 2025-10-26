// server/routes/toolRoutes.js
const express = require('express');
const router = express.Router();

// Placeholder route to prevent crash
router.get('/', (req, res) => res.json({ message: 'Tool routes ready.' }));

module.exports = router;