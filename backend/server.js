const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

// MongoDB models
const Table = mongoose.model('Table', new mongoose.Schema({
  id: Number,
  players: [String],
  status: String
}));

const QueueItem = mongoose.model('QueueItem', new mongoose.Schema({
  name: String,
  phone: String
}));

// API endpoints
app.get('/api/tables', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

app.get('/api/queue', async (req, res) => {
  const queue = await QueueItem.find();
  res.json(queue);
});

app.post('/api/queue', async (req, res) => {
  const { name, phone } = req.body;
  const newQueueItem = new QueueItem({ name, phone });
  await newQueueItem.save();
  res.status(201).json({ message: 'Added to queue' });
});

app.delete('/api/queue/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const removedPlayer = await QueueItem.findByIdAndDelete(id);
    if (removedPlayer) {
      res.json({ message: 'Removed from queue', removedPlayer });
    } else {
      res.status(404).json({ message: 'Player not found in queue' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid queue ID' });
  }
});

// Initialize tables if they don't exist
async function initializeTables() {
  const count = await Table.countDocuments();
  if (count === 0) {
    const initialTables = Array(6).fill().map((_, i) => ({ id: i + 1, players: [], status: 'available' }));
    await Table.insertMany(initialTables);
  }
}

initializeTables();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
