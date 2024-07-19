import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TableStatus() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      const res = await axios.get('http://localhost:5000/api/tables');
      setTables(res.data);
    };
    fetchTables();
    // Set up real-time updates here (e.g., using WebSockets)
  }, []);

  return (
    <div>
      <h2>Table Status</h2>
      {tables.map(table => (
        <div key={table.id}>
          <h3>Table {table.id}</h3>
          <p>Status: {table.status}</p>
          <p>Players: {table.players.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default TableStatus;
