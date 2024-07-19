import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Grid, Heading } from '@chakra-ui/react';
import TableStatus from './TableStatus';

function Dashboard() {
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

    // Set up socket connection for real-time updates
    const socket = io('http://localhost:5000');
    socket.on('tableUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Box>
      <Heading as="h1" size="xl" textAlign="center" my={4}>
        Table Dashboard
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {tables.map((table) => (
          <TableStatus key={table.id} table={table} />
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
