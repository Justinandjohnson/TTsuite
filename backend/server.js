const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
console.log('Connecting with URI:', uri.replace(/:([^@]+)@/, ':****@'));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let Queue;
let Tables;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("your_database_name"); // Replace with your actual database name
    Queue = db.collection("queue");
    Tables = db.collection("tables");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

connectToDatabase();

// Queue routes
app.get('/api/queue', async (req, res) => {
  try {
    const queue = await Queue.find().sort({ position: 1 }).toArray();
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/queue', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const lastInQueue = await Queue.find().sort({ position: -1 }).limit(1).toArray();
    const position = lastInQueue.length > 0 ? lastInQueue[0].position + 1 : 1;
    
    const estimatedWaitTime = (position - 1) * 15; // Assuming 15 minutes per game
    
    const newQueueItem = { name, phone, position, estimatedWaitTime };
    await Queue.insertOne(newQueueItem);
    
    // Update estimated wait times for all queue items
    await Queue.updateMany({}, [
      { $set: { estimatedWaitTime: { $multiply: [{ $subtract: ["$position", 1] }, 15] } } }
    ]);
    
    const updatedQueue = await Queue.find().sort({ position: 1 }).toArray();
    // If you're using Socket.IO, emit the updated queue here
    // io.emit('queueUpdate', updatedQueue);
    
    res.status(201).json({ message: 'Player added to queue', position: position, estimatedWaitTime });
  } catch (error) {
    console.error('Error adding player to queue:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Queue.findOneAndDelete({ _id: new ObjectId(id) });
    if (!deletedItem.value) {
      return res.status(404).json({ message: 'Queue item not found' });
    }
    await Queue.updateMany(
      { position: { $gt: deletedItem.value.position } },
      { $inc: { position: -1 } }
    );
    const updatedQueue = await Queue.find().sort({ position: 1 }).toArray();
    res.json({ message: 'Queue item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Table routes
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await Tables.find().sort({ id: 1 }).toArray();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const lastTable = await Tables.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastTable.length > 0 ? lastTable[0].id + 1 : 1;
    const newTable = { id: newId, status: 'available', players: [] };
    await Tables.insertOne(newTable);
    res.status(201).json(newTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, players } = req.body;
    const result = await Tables.updateOne(
      { id: parseInt(id) },
      { $set: { status, players } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Tables.deleteOne({ id: parseInt(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
