const axios = require('axios');
const mongoose = require('mongoose');
const { connectDB, Table, QueueItem } = require('./db');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('Starting tests...');

  try {
    await connectDB();

    // Test MongoDB connection
    console.log('MongoDB connection:', mongoose.connection.readyState === 1 ? 'PASS' : 'FAIL');

    // Clear existing data
    await Table.deleteMany({});
    await QueueItem.deleteMany({});

    // Test Table creation
    const newTable = new Table({ id: 1, players: [], status: 'available' });
    await newTable.save();
    console.log('Table creation:', newTable.id === 1 ? 'PASS' : 'FAIL');

    // Test GET /api/tables
    const tablesResponse = await axios.get(`${API_URL}/tables`);
    console.log('GET /api/tables:', tablesResponse.status === 200 && tablesResponse.data.length === 1 ? 'PASS' : 'FAIL');

    // Test POST /api/queue
    const newPlayer = { name: 'Test Player', phone: '1234567890' };
    const addToQueueResponse = await axios.post(`${API_URL}/queue`, newPlayer);
    console.log('POST /api/queue:', addToQueueResponse.status === 201 ? 'PASS' : 'FAIL');

    // Test GET /api/queue
    const queueResponse = await axios.get(`${API_URL}/queue`);
    const addedPlayer = queueResponse.data.find(player => player.name === newPlayer.name && player.phone === newPlayer.phone);
    console.log('GET /api/queue:', queueResponse.status === 200 && addedPlayer ? 'PASS' : 'FAIL');

    // Test DELETE /api/queue/:id
    if (addedPlayer) {
      const deleteResponse = await axios.delete(`${API_URL}/queue/${addedPlayer._id}`);
      console.log('DELETE /api/queue/:id:', deleteResponse.status === 200 ? 'PASS' : 'FAIL');

      const finalQueueResponse = await axios.get(`${API_URL}/queue`);
      const playerRemoved = !finalQueueResponse.data.some(player => player._id === addedPlayer._id);
      console.log('Player removed from queue:', playerRemoved ? 'PASS' : 'FAIL');
    }

    // Test PUT /api/tables/:id
    const updateTableResponse = await axios.put(`${API_URL}/tables/1`, { status: 'occupied', players: ['Player 1', 'Player 2'] });
    console.log('PUT /api/tables/:id:', updateTableResponse.status === 200 && updateTableResponse.data.status === 'occupied' ? 'PASS' : 'FAIL');

    // Test error handling
    try {
      await axios.get(`${API_URL}/nonexistent-endpoint`);
    } catch (error) {
      console.log('Error handling for non-existent endpoint:', error.response.status === 404 ? 'PASS' : 'FAIL');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }

  console.log('Tests completed.');
}

runTests();
