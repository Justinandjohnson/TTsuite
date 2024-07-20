const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Table = require('./models/Table');
const Queue = require('./models/Queue');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI;
console.log('Connecting with URI:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Queue routes
app.get('/api/queue', async (req, res) => {
  try {
    const queue = await Queue.find().sort({ position: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/queue', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const lastInQueue = await Queue.findOne().sort({ position: -1 });
    const position = lastInQueue ? lastInQueue.position + 1 : 1;
    
    const estimatedWaitTime = (position - 1) * 15; // Assuming 15 minutes per game
    
    const newQueueItem = new Queue({ name, phone, position, estimatedWaitTime });
    await newQueueItem.save();
    
    // Update estimated wait times for all queue items
    await Queue.updateMany({}, [
      { $set: { estimatedWaitTime: { $multiply: [{ $subtract: ["$position", 1] }, 15] } } } 
    ]);
    
    const updatedQueue = await Queue.find().sort({ position: 1 });
    
    // If you're using Socket.IO, emit the updated queue here
    io.emit('queueUpdate', updatedQueue);
    
    res.status(201).json({ message: 'Player added to queue', position: position, estimatedWaitTime });
  } catch (error) {
    console.error('Error adding player to queue:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Queue.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Player not found in queue' });
    }
    
    // Update positions for remaining queue items
    await Queue.updateMany(
      { position: { $gt: result.position } },
      { $inc: { position: -1 } }
    );

    // Fetch updated queue
    const updatedQueue = await Queue.find().sort({ position: 1 });
    
    // Emit updated queue to all connected clients
    io.emit('queueUpdate', updatedQueue);

    res.json({ message: 'Player removed from queue successfully' });
  } catch (error) {
    console.error('Error removing player from queue:', error);
    res.status(500).json({ message: 'Failed to remove player from queue', error: error.message });
  }
});

// Table routes
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await Table.find().sort({ id: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const { capacity } = req.body; // Allow specifying capacity when creating a table
    const lastTable = await Table.findOne().sort({ id: -1 });
    const newId = lastTable ? lastTable.id + 1 : 1;
    const newTable = new Table({ 
      id: newId, 
      status: 'available', 
      capacity: capacity || 2, // Default to 2 if not specified
      currentPlayers: [] 
    });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (error) {
    console.error('Error adding new table:', error);
    res.status(500).json({ message: 'Failed to add new table', error: error.message });
  }
});

app.put('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;
    
    const table = await Table.findOne({ id: parseInt(id) });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.currentPlayers.length >= table.capacity) {
      return res.status(400).json({ message: 'Table is full' });
    }

    const player = await Queue.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found in queue' });
    }

    table.currentPlayers.push({ id: player._id, name: player.name });
    table.status = table.currentPlayers.length === table.capacity ? 'occupied' : 'available';
    await table.save();
    await Queue.findByIdAndDelete(playerId);

    const updatedTables = await Table.find().sort({ id: 1 });
    const updatedQueue = await Queue.find().sort({ position: 1 });

    io.emit('tableUpdate', updatedTables);
    io.emit('queueUpdate', updatedQueue);

    res.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ message: 'Failed to update table', error: error.message });
  }
});

app.delete('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Table.deleteOne({ id: parseInt(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/port', (req, res) => {
  res.json({ port: server.address().port });
});

app.post('/api/reset', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    // Increase timeout for this operation
    await Queue.deleteMany({}).maxTimeMS(30000);
    await Table.updateMany({}, { $set: { status: 'available', currentPlayers: [] } }).maxTimeMS(30000);
    
    const updatedTables = await Table.find().lean().maxTimeMS(30000);
    
    io.emit('queueUpdate', []);
    io.emit('tableUpdate', updatedTables.map(table => ({
      id: table.id,
      status: table.status,
      currentPlayers: table.currentPlayers
    })));
    
    res.json({ message: 'All data reset successfully' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ message: 'Failed to reset data', error: error.message });
  }
});

const http = require('http');
const { Server } = require("socket.io");
const net = require('net');
const { exec } = require('child_process');
const readline = require('readline');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Function to find an available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      findAvailablePort(startPort + 1).then(resolve, reject);
    });
  });
}

// Function to get process using a port (Windows-specific, adjust for other OS)
function getProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        const pid = lines[0].split(/\s+/).pop();
        exec(`tasklist /fi "PID eq ${pid}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return reject(error);
          }
          const processInfo = stdout.trim().split('\n').slice(3).join('\n');
          resolve({ pid, info: processInfo });
        });
      } else {
        resolve(null);
      }
    });
  });
}

const DEFAULT_PORT = 5000;

async function startServer() {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    if (port !== DEFAULT_PORT) {
      console.log(`Port ${DEFAULT_PORT} is in use. Using port ${port} instead.`);
      const processInfo = await getProcessOnPort(DEFAULT_PORT);
      if (processInfo) {
        console.log(`Process using port ${DEFAULT_PORT}:`);
        console.log(processInfo.info);
        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        rl.question('Do you want to terminate this process? (y/n) ', (answer) => {
          rl.close();
          if (answer.toLowerCase() === 'y') {
            process.exit(0);
          }
        });
      }
    }
    io.on('connection', (socket) => {
      console.log('A user connected');
      // Add your Socket.IO event handlers here
    });

    server.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    return res.status(500).json({ message: 'Database not connected' });
  }
  next();
});