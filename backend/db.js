const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const Table = mongoose.model('Table', new mongoose.Schema({
  id: Number,
  players: [String],
  status: String
}));

const QueueItem = mongoose.model('QueueItem', new mongoose.Schema({
  name: String,
  phone: String,
  joinedAt: { type: Date, default: Date.now }
}));

module.exports = { connectDB, Table, QueueItem };
