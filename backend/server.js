const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// Import Table model
const Table = require(path.join(__dirname, 'models', 'Table'));

// Update MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

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

initializeTables();

// Add your routes here
// app.use('/api/tables', tableRoutes);
// app.use('/api/queue', queueRoutes);

let server;

function startServer() {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please use a different port.`);
      process.exit(1);
    } else {
      console.error('Error starting server:', err);
    }
  });
}

startServer();

// Graceful shutdown
function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Closed out remaining connections.');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });

    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);