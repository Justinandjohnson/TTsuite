import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, useToast, Checkbox, Link } from '@chakra-ui/react';
import axios from 'axios';

function SignIn() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast({
        title: 'Error',
        description: 'Please agree to the terms and conditions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/queue', { name, phone });
      toast({
        title: 'Success',
        description: `${name}, you've been added to the queue! Your position is ${response.data.position}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setName('');
      setPhone('');
      setAgreeToTerms(false);
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
      <VStack spacing={6} align="stretch" bg="rgba(0,0,0,0.7)" p={6} borderRadius="md">
        <Heading as="h2" size="xl" textAlign="center" mb={4} color="teal.300">
          Join the Table Tennis Queue
        </Heading>
        <Text textAlign="center" fontSize="md" color="gray.300">
          Enter your details below to join the queue. We'll notify you when it's your turn to play!
        </Text>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              bg="gray.700"
            />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              bg="gray.700"
            />
          </FormControl>
          <Checkbox 
            mt={4} 
            isChecked={agreeToTerms} 
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            colorScheme="teal"
          >
            I agree to the <Link color="teal.300" href="#">terms and conditions</Link>
          </Checkbox>
          <Button 
            type="submit" 
            colorScheme="teal" 
            width="full" 
            mt={6}
            isDisabled={!agreeToTerms}
          >
            Join Queue
          </Button>
        </form>
        <Text fontSize="sm" color="gray.400" textAlign="center">
          By joining the queue, you agree to receive SMS notifications about your turn.
        </Text>
      </VStack>
    </Box>
  );
}

export default SignIn;
