import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Queue() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchQueue = async () => {
      const res = await axios.get('http://localhost:5000/api/queue');
      setQueue(res.data);
    };
    fetchQueue();
    // Set up real-time updates here
  }, []);

  const removeFromQueue = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/queue/${id}`);
      setQueue(queue.filter(player => player._id !== id));
    } catch (error) {
      console.error('Error removing player from queue:', error);
    }
  };

  return (
    <div>
      <h2>Queue</h2>
      <ul>
        {queue.map((player) => (
          <li key={player._id}>
            {player.name} - {player.phone}
            <button onClick={() => removeFromQueue(player._id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Queue;
