import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Heading, VStack, HStack, Text, Button, useToast, Container } from '@chakra-ui/react';

const socket = io('http://localhost:5000');

function Queue() {
  const [queue, setQueue] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/queue');
        setQueue(res.data);
      } catch (error) {
        console.error('Error fetching queue:', error);
      }
    };
    fetchQueue();

    socket.on('queueUpdate', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => socket.disconnect();
  }, []);

  const removeFromQueue = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/queue/${id}`);
      toast({
        title: "Player removed",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing player from queue:', error);
      toast({
        title: "Error removing player",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h2" size="2xl" mb={8} color="teal.300">Queue</Heading>
      <VStack spacing={4} align="stretch">
        {queue.map((player, index) => (
          <Box key={player._id} bg="gray.700" p={6} borderRadius="lg" boxShadow="lg">
            <HStack justifyContent="space-between">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" fontSize="xl">{player.name}</Text>
                <Text fontSize="md" color="gray.400">{player.phone}</Text>
                <Text fontSize="md" color="teal.300">
                  Estimated wait: {player.estimatedWaitTime} minutes
                </Text>
              </VStack>
              <VStack align="end" spacing={2}>
                <Text fontSize="lg" fontWeight="bold" color="teal.300">Position: {index + 1}</Text>
                <Button colorScheme="red" size="md" onClick={() => removeFromQueue(player._id)}>
                  Remove
                </Button>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Container>
  );
}

export default Queue;
