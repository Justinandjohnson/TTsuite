import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Grid, Heading, Container } from '@chakra-ui/react';
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

    const socket = io('http://localhost:5000');
    socket.on('tableUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="2xl" textAlign="center" mb={8} color="teal.300">
        Table Dashboard
      </Heading>
      <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]} gap={8}>
        {tables.map((table) => (
          <TableStatus key={table.id} table={table} />
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
