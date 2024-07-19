const axios = require('axios');
const io = require('socket.io-client');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const API_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';
const MONGODB_URI = process.env.MONGODB_URI;

let socket;
let mongoClient;

describe('Table Tennis Queue System Integration Test', () => {
  beforeAll(async () => {
    socket = io(SOCKET_URL);
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  });

  afterAll(async () => {
    if (socket) socket.disconnect();
    if (mongoClient) await mongoClient.close();
  });

  it('should add players to queue, assign them to tables, and update in real-time', async () => {
    const db = mongoClient.db();
    const queueCollection = db.collection('queue');
    const tablesCollection = db.collection('tables');

    // Clear existing data
    await queueCollection.deleteMany({});
    await tablesCollection.deleteMany({});

    // Add initial tables
    await axios.post(`${API_URL}/api/tables`);
    await axios.post(`${API_URL}/api/tables`);

    // Set up socket listeners
    const queueUpdates = [];
    const tableUpdates = [];
    socket.on('queueUpdate', (data) => queueUpdates.push(data));
    socket.on('tableUpdate', (data) => tableUpdates.push(data));

    // Add players to queue
    const players = [
      { name: 'Alice', phone: '1234567890' },
      { name: 'Bob', phone: '2345678901' },
      { name: 'Charlie', phone: '3456789012' },
      { name: 'David', phone: '4567890123' },
    ];

    for (const player of players) {
      await axios.post(`${API_URL}/api/queue`, player);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for socket update
    }

    // Check queue updates
    expect(queueUpdates.length).toBe(4);
    expect(queueUpdates[3].length).toBe(4);
    expect(queueUpdates[3][0].name).toBe('Alice');
    expect(queueUpdates[3][3].name).toBe('David');

    // Assign players to tables
    const tables = await axios.get(`${API_URL}/api/tables`);
    await axios.put(`${API_URL}/api/tables/${tables.data[0].id}`, { 
      status: 'occupied', 
      players: ['Alice', 'Bob']
    });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for socket update

    await axios.put(`${API_URL}/api/tables/${tables.data[1].id}`, { 
      status: 'occupied', 
      players: ['Charlie', 'David']
    });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for socket update

    // Check table updates
    expect(tableUpdates.length).toBe(2);
    expect(tableUpdates[1][0].status).toBe('occupied');
    expect(tableUpdates[1][0].players).toEqual(['Alice', 'Bob']);
    expect(tableUpdates[1][1].status).toBe('occupied');
    expect(tableUpdates[1][1].players).toEqual(['Charlie', 'David']);

    // Check queue is empty
    const finalQueue = await axios.get(`${API_URL}/api/queue`);
    expect(finalQueue.data.length).toBe(0);

    // Reset everything
    await queueCollection.deleteMany({});
    await tablesCollection.deleteMany({});

    console.log('Integration test completed successfully!');
  }, 30000); // Increase timeout to 30 seconds for this test
});
