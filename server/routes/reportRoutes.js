// server/routes/reportRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getAllStockReport,
    getDangerousStockReport,
    getDailyStockReport
} = require('../controllers/reportController');

const router = express.Router();

// All Report routes require authentication (protect)

// @route   GET /api/reports/all
// @desc    Get all Accessory and Tool data for full report
// @access  Private (Admin or User)
router.get('/all', protect, getAllStockReport);

// @route   GET /api/reports/dangerous
// @desc    Get report of dangerous stock (Stock Out < 20% of Stock In)
// @access  Private (Admin or User)
router.get('/dangerous', protect, getDangerousStockReport);

// @route   GET /api/reports/daily/:type
// @desc    Get daily report for Accessory or Tool filtered by date range
// @access  Private (Admin or User)
// Query Params: startDate, endDate, itemType (accessory or tool)
router.get('/daily/:itemType', protect, getDailyStockReport);

module.exports = router;
