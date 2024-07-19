import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Heading, VStack, HStack, Text, Button, useToast } from '@chakra-ui/react';

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
    <Box w="100%">
      <Heading as="h2" size="xl" mb={6}>Queue</Heading>
      <VStack spacing={4} align="stretch">
        {queue.map((player, index) => (
          <HStack key={player._id} bg="white" p={4} borderRadius="md" boxShadow="md" justifyContent="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{player.name}</Text>
              <Text fontSize="sm" color="gray.600">{player.phone}</Text>
              <Text fontSize="sm" color="blue.600">
                Estimated wait: {player.estimatedWaitTime} minutes
              </Text>
            </VStack>
            <VStack align="end" spacing={1}>
              <Text fontSize="sm" fontWeight="bold">Position: {index + 1}</Text>
              <Button colorScheme="red" size="sm" onClick={() => removeFromQueue(player._id)}>
                Remove
              </Button>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

export default Queue;