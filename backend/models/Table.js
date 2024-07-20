const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  status: { type: String, required: true, default: 'available' },
  capacity: { type: Number, required: true, default: 2 }, // Can be 2 or 4
  currentPlayers: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
    name: String
  }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Table', TableSchema);