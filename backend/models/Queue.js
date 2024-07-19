const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  estimatedWaitTime: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Queue', QueueSchema);
