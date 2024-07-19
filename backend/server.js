const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import models
const Table = require(path.join(__dirname, 'models', 'Table'));
const Queue = require(path.join(__dirname, 'models', 'Queue'));

// Update MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);  // Exit the process if unable to connect to MongoDB
});

// Initialize tables if they don't exist
async function initializeTables() {
  try {
    const count = await Table.countDocuments();
    if (count === 0) {
      const initialTables = Array(6).fill().map((_, i) => ({ id: i + 1, players: [], status: 'available' }));
      await Table.insertMany(initialTables);
      console.log('Tables initialized');
    }
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

// Only initialize tables after successful connection
mongoose.connection.once('open', () => {
  initializeTables();
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Table routes
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, players } = req.body;
    const updatedTable = await Table.findOneAndUpdate(
      { id: id },
      { status, players },
      { new: true }
    );
    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }
    const tables = await Table.find();
    io.emit('tableUpdate', tables);
    res.json(updatedTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Queue routes
app.get('/api/queue', async (req, res) => {
  try {
    const queue = await Queue.find().sort('position');
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/queue', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const lastInQueue = await Queue.findOne().sort('-position');
    const position = lastInQueue ? lastInQueue.position + 1 : 1;
    const newQueueItem = new Queue({ name, phone, position });
    await newQueueItem.save();
    const updatedQueue = await Queue.find().sort('position');
    io.emit('queueUpdate', updatedQueue);
    res.status(201).json(newQueueItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Queue.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }
    // Reorder remaining queue items
    await Queue.updateMany(
      { position: { $gt: deletedItem.position } },
      { $inc: { position: -1 } }
    );
    const updatedQueue = await Queue.find().sort('position');
    io.emit('queueUpdate', updatedQueue);
    res.json({ message: 'Queue item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
