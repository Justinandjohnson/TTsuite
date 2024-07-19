import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Grid, Heading, Container, Box, Text, VStack, HStack, Badge, Button, Input, useToast } from '@chakra-ui/react';

function Dashboard() {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const toast = useToast();

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

  const addPlayerToQueue = async () => {
    if (!newPlayerName || !newPlayerPhone) {
      toast({
        title: "Error",
        description: "Please enter both name and phone number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/queue', { name: newPlayerName, phone: newPlayerPhone });
      setNewPlayerName('');
      setNewPlayerPhone('');
      toast({
        title: "Success",
        description: `Player added to the queue. Position: ${response.data.position}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Fetch updated queue
      const updatedQueueRes = await axios.get('http://localhost:5000/api/queue');
      setQueue(updatedQueueRes.data);
    } catch (error) {
      console.error('Error adding player to queue:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add player to the queue.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="rgba(0,0,0,0.8)" p={6} borderRadius="md" boxShadow="xl">
        <Heading as="h1" size="2xl" textAlign="center" mb={8} color="teal.300">
          Table Tennis Dashboard
        </Heading>
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]} gap={8} mb={8}>
          {tables.map((table) => (
            <Box key={table.id} bg="gray.800" p={4} borderRadius="md" boxShadow="lg" border="1px" borderColor="gray.700">
              <Heading as="h3" size="lg" mb={2} color="white">
                Table {table.id}
              </Heading>
              <Badge colorScheme={getStatusColor(table.status)} mb={2} fontSize="md">
                {table.status}
              </Badge>
              {table.players.length > 0 && (
                <VStack align="start" mt={2}>
                  <Text fontWeight="bold" color="white">Players:</Text>
                  {table.players.map((player, index) => (
                    <Text key={index} color="gray.300">{player}</Text>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </Grid>
        <Heading as="h2" size="xl" textAlign="center" mt={8} mb={4} color="teal.300">
          Queue
        </Heading>
        <VStack spacing={4} align="stretch" mb={8}>
          {queue.map((player, index) => (
            <Box key={player._id} bg="gray.800" p={4} borderRadius="md" boxShadow="lg" border="1px" borderColor="gray.700">
              <HStack justifyContent="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {index + 1}. {player.name}
                  </Text>
                  <Text fontSize="sm" color="gray.400">{player.phone}</Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
        <Box bg="gray.800" p={4} borderRadius="md" boxShadow="lg" border="1px" borderColor="gray.700">
          <Heading as="h3" size="md" mb={4} color="teal.300">
            Add Player to Queue
          </Heading>
          <VStack spacing={4}>
            <Input
              placeholder="Player Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              bg="gray.700"
              color="white"
            />
            <Input
              placeholder="Phone Number"
              value={newPlayerPhone}
              onChange={(e) => setNewPlayerPhone(e.target.value)}
              bg="gray.700"
              color="white"
            />
            <Button colorScheme="teal" onClick={addPlayerToQueue}>
              Add to Queue
            </Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard;
