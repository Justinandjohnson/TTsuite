import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Grid, Heading, Container, Box, Text, VStack } from '@chakra-ui/react';

function Dashboard() {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesRes, queueRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tables'),
          axios.get('http://localhost:5000/api/queue')
        ]);
        setTables(tablesRes.data);
        setQueue(queueRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    const socket = io('http://localhost:5000');
    socket.on('tableUpdate', (updatedTables) => {
      setTables(updatedTables);
    });
    socket.on('queueUpdate', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="rgba(0,0,0,0.7)" p={6} borderRadius="md">
        <Heading as="h1" size="2xl" textAlign="center" mb={8} color="teal.300">
          Table Dashboard
        </Heading>
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]} gap={8}>
          {tables.map((table) => (
            <Box key={table.id} bg="gray.700" p={4} borderRadius="md">
              <Heading as="h3" size="lg" mb={2}>
                Table {table.id}
              </Heading>
              <Text>Status: {table.status}</Text>
              {table.players.length > 0 && (
                <VStack align="start" mt={2}>
                  <Text fontWeight="bold">Players:</Text>
                  {table.players.map((player, index) => (
                    <Text key={index}>{player}</Text>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </Grid>
        <Heading as="h2" size="xl" textAlign="center" mt={8} mb={4} color="teal.300">
          Queue
        </Heading>
        <VStack spacing={4} align="stretch">
          {queue.map((player, index) => (
            <Box key={player._id} bg="gray.700" p={4} borderRadius="md">
              <Text fontWeight="bold">
                {index + 1}. {player.name}
              </Text>
              <Text>Phone: {player.phone}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Container>
  );
}

export default Dashboard;
