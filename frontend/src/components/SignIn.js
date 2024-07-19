import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast } from '@chakra-ui/react';
import axios from 'axios';

function SignIn() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/queue', { name, phone });
      toast({
        title: 'Success',
        description: `${name} has been added to the queue.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setName('');
      setPhone('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to queue. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={4} align="stretch" bg="rgba(0,0,0,0.7)" p={6} borderRadius="md">
        <Heading as="h2" size="xl" textAlign="center" mb={4}>
          Sign In to Queue
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" mt={6}>
            Join Queue
          </Button>
        </form>
      </VStack>
    </Box>
  );
}

export default SignIn;
