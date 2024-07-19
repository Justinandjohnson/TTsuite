const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// MongoDB models
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

// Function to estimate wait time
const estimateWaitTime = (position) => {
  const averageGameTime = 15; // minutes
  return position * averageGameTime;
};

// API endpoints
app.get('/api/tables', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

app.get('/api/queue', async (req, res) => {
  const queue = await QueueItem.find().sort('joinedAt');
  const queueWithWaitTimes = queue.map((item, index) => ({
    ...item.toObject(),
    estimatedWaitTime: estimateWaitTime(index)
  }));
  res.json(queueWithWaitTimes);
});

app.post('/api/queue', async (req, res) => {
  const { name, phone } = req.body;
  const newQueueItem = new QueueItem({ name, phone });
  await newQueueItem.save();
  const updatedQueue = await QueueItem.find();
  io.emit('queueUpdate', updatedQueue);
  res.status(201).json({ message: 'Added to queue' });
});

app.delete('/api/queue/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const removedPlayer = await QueueItem.findByIdAndDelete(id);
    if (removedPlayer) {
      const updatedQueue = await QueueItem.find();
      io.emit('queueUpdate', updatedQueue);
      res.json({ message: 'Removed from queue', removedPlayer });
    } else {
      res.status(404).json({ message: 'Player not found in queue' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid queue ID' });
  }
});

app.put('/api/tables/:id', async (req, res) => {
  const { id } = req.params;
  const { status, players } = req.body;
  try {
    const updatedTable = await Table.findOneAndUpdate(
      { id: parseInt(id) },
      { status, players },
      { new: true }
    );
    if (updatedTable) {
      const allTables = await Table.find();
      io.emit('tableUpdate', allTables);
      res.json(updatedTable);
    } else {
      res.status(404).json({ message: 'Table not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating table', error: error.message });
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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
