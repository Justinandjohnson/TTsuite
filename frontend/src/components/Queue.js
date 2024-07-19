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

  return (
    <div>
      <h2>Queue</h2>
      <ul>
        {queue.map((player, index) => (
          <li key={index}>{player.name} - {player.phone}</li>
        ))}
      </ul>
    </div>
  );
}

export default Queue;
