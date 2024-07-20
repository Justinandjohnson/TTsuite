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

  beforeEach(async () => {
    const db = mongoClient.db();
    await db.collection('queue').deleteMany({});
    await db.collection('tables').deleteMany({});
  });

  it('should add and remove tables', async () => {
    // Add tables
    const table1 = await axios.post(`${API_URL}/api/tables`);
    const table2 = await axios.post(`${API_URL}/api/tables`);
    
    expect(table1.data.id).toBe(1);
    expect(table2.data.id).toBe(2);

    // Get tables
    const tablesResponse = await axios.get(`${API_URL}/api/tables`);
    expect(tablesResponse.data.length).toBe(2);

    // Remove a table
    await axios.delete(`${API_URL}/api/tables/${table1.data.id}`);
    
    const updatedTablesResponse = await axios.get(`${API_URL}/api/tables`);
    expect(updatedTablesResponse.data.length).toBe(1);
    expect(updatedTablesResponse.data[0].id).toBe(2);
  });

  it('should add players to queue, assign them to tables, and update in real-time', async () => {
    const queueUpdates = [];
    const tableUpdates = [];
    socket.on('queueUpdate', (data) => queueUpdates.push(data));
    socket.on('tableUpdate', (data) => tableUpdates.push(data));

    // Add initial tables
    await axios.post(`${API_URL}/api/tables`);
    await axios.post(`${API_URL}/api/tables`);

    // Add players to queue
    const players = [
      { name: 'Alice', phone: '1234567890' },
      { name: 'Bob', phone: '2345678901' },
      { name: 'Charlie', phone: '3456789012' },
      { name: 'David', phone: '4567890123' },
      { name: 'Eve', phone: '5678901234' },
      { name: 'Frank', phone: '6789012345' },
      { name: 'Grace', phone: '7890123456' },
      { name: 'Henry', phone: '8901234567' },
    ];

    for (const player of players) {
      await axios.post(`${API_URL}/api/queue`, player);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for socket update
    }

    // Check queue updates
    expect(queueUpdates.length).toBe(8);
    expect(queueUpdates[7].length).toBe(8);
    expect(queueUpdates[7][0].name).toBe('Alice');
    expect(queueUpdates[7][7].name).toBe('Henry');

    // Assign players to tables
    const tables = await axios.get(`${API_URL}/api/tables`);
    for (let i = 0; i < tables.data.length; i++) {
      const playersForTable = players.slice(i * 2, (i + 1) * 2);
      await axios.put(`${API_URL}/api/tables/${tables.data[i].id}`, { 
        status: 'occupied', 
        players: playersForTable.map(p => p.name)
      });
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for socket update
    }

    // Check table updates
    expect(tableUpdates.length).toBe(2);
    expect(tableUpdates[1][0].status).toBe('occupied');
    expect(tableUpdates[1][0].players).toEqual(['Alice', 'Bob']);
    expect(tableUpdates[1][1].status).toBe('occupied');
    expect(tableUpdates[1][1].players).toEqual(['Charlie', 'David']);

    // Check remaining players in queue
    const finalQueue = await axios.get(`${API_URL}/api/queue`);
    expect(finalQueue.data.length).toBe(4);
    expect(finalQueue.data[0].name).toBe('Eve');
    expect(finalQueue.data[3].name).toBe('Henry');

    // Add one more table
    await axios.post(`${API_URL}/api/tables`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for socket update

    // Assign remaining players to the new table
    const newTables = await axios.get(`${API_URL}/api/tables`);
    const newTable = newTables.data.find(t => t.status === 'available');
    await axios.put(`${API_URL}/api/tables/${newTable.id}`, { 
      status: 'occupied', 
      players: ['Eve', 'Frank']
    });
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for socket update

    // Check final queue state
    const finalQueueState = await axios.get(`${API_URL}/api/queue`);
    expect(finalQueueState.data.length).toBe(2);
    expect(finalQueueState.data[0].name).toBe('Grace');
    expect(finalQueueState.data[1].name).toBe('Henry');

    // Check final table state
    const finalTableState = await axios.get(`${API_URL}/api/tables`);
    expect(finalTableState.data.length).toBe(3);
    expect(finalTableState.data.every(t => t.status === 'occupied')).toBe(true);
  });

  it('should handle queue operations correctly', async () => {
    // Add players to queue
    const player1 = await axios.post(`${API_URL}/api/queue`, { name: 'Eve', phone: '5678901234' });
    const player2 = await axios.post(`${API_URL}/api/queue`, { name: 'Frank', phone: '6789012345' });

    // Check queue
    const queue = await axios.get(`${API_URL}/api/queue`);
    expect(queue.data.length).toBe(2);
    expect(queue.data[0].name).toBe('Eve');
    expect(queue.data[1].name).toBe('Frank');

    // Remove player from queue
    await axios.delete(`${API_URL}/api/queue/${player1.data._id}`);

    // Check updated queue
    const updatedQueue = await axios.get(`${API_URL}/api/queue`);
    expect(updatedQueue.data.length).toBe(1);
    expect(updatedQueue.data[0].name).toBe('Frank');
  });

  it('should update table status correctly', async () => {
    // Add a table
    const table = await axios.post(`${API_URL}/api/tables`);

    // Update table status
    await axios.put(`${API_URL}/api/tables/${table.data.id}`, { 
      status: 'occupied', 
      players: ['Grace', 'Henry']
    });

    // Check updated table
    const updatedTable = await axios.get(`${API_URL}/api/tables/${table.data.id}`);
    expect(updatedTable.data.status).toBe('occupied');
    expect(updatedTable.data.players).toEqual(['Grace', 'Henry']);

    // Set table back to available
    await axios.put(`${API_URL}/api/tables/${table.data.id}`, { 
      status: 'available', 
      players: []
    });

    // Check table is available
    const availableTable = await axios.get(`${API_URL}/api/tables/${table.data.id}`);
    expect(availableTable.data.status).toBe('available');
    expect(availableTable.data.players).toEqual([]);
  });

  it('should handle errors gracefully', async () => {
    // Try to get a non-existent table
    try {
      await axios.get(`${API_URL}/api/tables/999`);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }

    // Try to add a player with missing information
    try {
      await axios.post(`${API_URL}/api/queue`, { name: 'Invalid Player' });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }

    // Try to update a non-existent table
    try {
      await axios.put(`${API_URL}/api/tables/999`, { status: 'occupied' });
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});
