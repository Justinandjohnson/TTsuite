require('dotenv').config(); // Ensure this line is at the top to load .env variables

const mongoose = require('mongoose');

const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });

    const db = mongoose.connection;
    db.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      reject(error);
    });
    db.once('open', () => {
      console.log('Connected to MongoDB');
      resolve();
    });
  });
};

const TableSchema = new mongoose.Schema({
  id: Number,
  players: [String],
  status: String
});

const Table = mongoose.model('Table', TableSchema);

module.exports = { connectDB, Table };