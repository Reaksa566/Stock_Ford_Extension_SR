// server/controllers/reportController.js
const Accessory = require('../models/Accessory');
const Tool = require('../models/Tool');

/**
 * @desc    Get all Accessory and Tool data for full report
 * @route   GET /api/reports/all
 * @access  Private
 */
exports.getAllStockReport = async (req, res) => {
    try {
        const accessories = await Accessory.find({});
        const tools = await Tool.find({});
        
        res.status(200).json({
            accessories,
            tools,
            message: "Successfully retrieved all stock data."
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving all stock report', error: error.message });
    }
};

/**
 * @desc    Get report of dangerous stock (Total Stock < 20% of Stock In)
 * @route   GET /api/reports/dangerous
 * @access  Private
 */
exports.getDangerousStockReport = async (req, res) => {
    try {
        const calculateDangerous = (item) => {
            if (item.stockIn === 0) return false;
            // Stock Out < 20% នៃ Stock In (យើងនឹងបកស្រាយថា ស្តុកដែលនៅសល់ (Total Stock) តិចជាង 20% នៃស្តុកចូលសរុប)
            const threshold = item.stockIn * 0.20; 
            return item.totalStock < threshold;
        };

        const allAccessories = await Accessory.find({});
        const allTools = await Tool.find({});

        const dangerousAccessories = allAccessories.filter(calculateDangerous);
        const dangerousTools = allTools.filter(calculateDangerous);

        res.status(200).json({
            dangerousAccessories,
            dangerousTools,
            message: "Successfully retrieved dangerous stock report."
        });

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving dangerous stock report', error: error.message });
    }
};

/**
 * @desc    Get daily report for Accessory or Tool filtered by date range
 * @route   GET /api/reports/daily/:itemType
 * @access  Private
 * Query Params: startDate, endDate
 */
exports.getDailyStockReport = async (req, res) => {
    const { itemType } = req.params; // 'accessory' or 'tool'
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    // Convert dates to Date objects for Mongoose query
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    const Model = itemType === 'accessory' ? Accessory : itemType === 'tool' ? Tool : null;

    if (!Model) {
        return res.status(400).json({ message: 'Invalid item type specified.' });
    }

    try {
        // Aggregate to filter stockHistory based on date
        const dailyReport = await Model.aggregate([
            { $unwind: "$stockHistory" },
            { $match: {
                "stockHistory.date": {
                    $gte: start,
                    $lte: end
                }
            }},
            { $group: {
                _id: "$_id",
                description: { $first: "$description" },
                unit: { $first: "$unit" },
                stockIn: { 
                    $sum: { 
                        $cond: [{ $eq: ["$stockHistory.type", "IN"] }, "$stockHistory.quantity", 0] 
                    } 
                },
                stockOut: { 
                    $sum: { 
                        $cond: [{ $eq: ["$stockHistory.type", "OUT"] }, "$stockHistory.quantity", 0] 
                    } 
                },
                historyDetails: { $push: "$stockHistory" }
            }}
        ]);

        res.status(200).json({
            report: dailyReport,
            message: `Successfully retrieved daily report for ${itemType}.`
        });

    } catch (error) {
        res.status(500).json({ message: `Error retrieving daily report for ${itemType}`, error: error.message });
    }
};

