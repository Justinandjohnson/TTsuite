const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// Add your routes here
// app.use('/api/tables', tableRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});