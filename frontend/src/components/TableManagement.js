import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TableManagement() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tables');
        setTables(res.data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };
    fetchTables();
  }, []);

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tables/${tableId}`, { status: newStatus });
      setTables(tables.map(table => 
        table.id === tableId ? { ...table, status: newStatus } : table
      ));
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  return (
    <div>
      <h2>Table Management</h2>
      {tables.map(table => (
        <div key={table.id}>
          <h3>Table {table.id}</h3>
          <p>Status: {table.status}</p>
          <button onClick={() => updateTableStatus(table.id, 'available')}>Set Available</button>
          <button onClick={() => updateTableStatus(table.id, 'occupied')}>Set Occupied</button>
        </div>
      ))}
    </div>
  );
}

export default TableManagement;