import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Grid, Heading, Container, Box, Text, VStack, HStack, Badge, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'occupied':
        return 'red';
      default:
        return 'gray';
    }
  };

  const calculateWaitTime = (position) => {
    const averageGameTime = 15; // minutes
    return position * averageGameTime;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="rgba(0,0,0,0.7)" p={6} borderRadius="md">
        <Heading as="h1" size="2xl" textAlign="center" mb={8} color="teal.300">
          Table Tennis Dashboard
        </Heading>
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]} gap={8} mb={8}>
          {tables.map((table) => (
            <Box key={table.id} bg="gray.700" p={4} borderRadius="md" boxShadow="md">
              <Heading as="h3" size="lg" mb={2}>
                Table {table.id}
              </Heading>
              <Badge colorScheme={getStatusColor(table.status)} mb={2}>
                {table.status}
              </Badge>
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
            <Box key={player._id} bg="gray.700" p={4} borderRadius="md" boxShadow="md">
              <HStack justifyContent="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg">
                    {index + 1}. {player.name}
                  </Text>
                  <Text fontSize="sm" color="gray.400">{player.phone}</Text>
                </VStack>
                <Stat>
                  <StatLabel>Estimated Wait</StatLabel>
                  <StatNumber>{calculateWaitTime(index + 1)} min</StatNumber>
                  <StatHelpText>Position: {index + 1}</StatHelpText>
                </Stat>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Container>
  );
}

export default Dashboard;
