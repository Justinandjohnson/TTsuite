const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('Starting tests...');

  try {
    // Test GET /api/tables
    const tablesResponse = await axios.get(`${API_URL}/tables`);
    console.log('GET /api/tables:', tablesResponse.status === 200 ? 'PASS' : 'FAIL');
    console.log('Tables:', tablesResponse.data);

    // Test GET /api/queue
    const queueResponse = await axios.get(`${API_URL}/queue`);
    console.log('GET /api/queue:', queueResponse.status === 200 ? 'PASS' : 'FAIL');
    console.log('Queue:', queueResponse.data);

    // Test POST /api/queue
    const newPlayer = { name: 'Test Player', phone: '1234567890' };
    const addToQueueResponse = await axios.post(`${API_URL}/queue`, newPlayer);
    console.log('POST /api/queue:', addToQueueResponse.status === 201 ? 'PASS' : 'FAIL');
    console.log('Add to queue response:', addToQueueResponse.data);

    // Verify the queue was updated
    const updatedQueueResponse = await axios.get(`${API_URL}/queue`);
    const addedPlayer = updatedQueueResponse.data.find(player => player.name === newPlayer.name && player.phone === newPlayer.phone);
    console.log('Queue updated:', addedPlayer ? 'PASS' : 'FAIL');
    console.log('Updated Queue:', updatedQueueResponse.data);

    // Test DELETE /api/queue/:id
    if (addedPlayer) {
      const deleteResponse = await axios.delete(`${API_URL}/queue/${addedPlayer._id}`);
      console.log('DELETE /api/queue/:id:', deleteResponse.status === 200 ? 'PASS' : 'FAIL');
      console.log('Delete response:', deleteResponse.data);

      // Verify the queue was updated after deletion
      const finalQueueResponse = await axios.get(`${API_URL}/queue`);
      const playerRemoved = !finalQueueResponse.data.some(player => player._id === addedPlayer._id);
      console.log('Player removed from queue:', playerRemoved ? 'PASS' : 'FAIL');
      console.log('Final Queue:', finalQueueResponse.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }

  console.log('Tests completed.');
}

runTests();
