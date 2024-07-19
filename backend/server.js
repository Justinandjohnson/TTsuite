const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sample data structure for tables and queue
let tables = Array(6).fill().map((_, i) => ({ id: i + 1, players: [], status: 'available' }));
let queue = [];

// API endpoints
app.get('/api/tables', (req, res) => {
  res.json(tables);
});

app.get('/api/queue', (req, res) => {
  res.json(queue);
});

app.post('/api/queue', (req, res) => {
  const { name, phone } = req.body;
  queue.push({ name, phone });
  res.status(201).json({ message: 'Added to queue' });
});

app.delete('/api/queue/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < queue.length) {
    const removedPlayer = queue.splice(index, 1)[0];
    res.json({ message: 'Removed from queue', removedPlayer });
  } else {
    res.status(400).json({ message: 'Invalid queue index' });
  }
});

// More endpoints will be added for managing tables, updating matches, etc.

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
