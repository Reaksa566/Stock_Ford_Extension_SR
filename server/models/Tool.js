// server/models/Tool.js
const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
  description: { type: String, required: true, unique: true },
  unit: { type: String },
  stockHistory: [{
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    reference: { type: String },
  }],
  stockIn: { type: Number, default: 0 },
  stockOut: { type: Number, default: 0 },
  totalStock: { type: Number, default: 0 },
  // ... more fields as needed
});

module.exports = mongoose.model('Tool', ToolSchema);