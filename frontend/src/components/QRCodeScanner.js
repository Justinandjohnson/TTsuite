import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
import axios from 'axios';
import { Box, Heading, Text, VStack, useToast } from '@chakra-ui/react';

function QRCodeScanner() {
  const [result, setResult] = useState('');
  const toast = useToast();

  const handleScan = async (data) => {
    if (data) {
      setResult(data);
      try {
        const playerInfo = JSON.parse(data);
        await axios.post('http://localhost:5000/api/queue', playerInfo);
        toast({
          title: "Successfully added to queue!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error adding to queue:', error);
        toast({
          title: "Failed to add to queue",
          description: "Please try again",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    toast({
      title: "QR Scanner Error",
      description: "There was an error with the QR scanner",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box w="100%">
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl">Scan QR Code to Join Queue</Heading>
        <Box maxW="400px" mx="auto">
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
        </Box>
        {result && (
          <Text fontSize="lg" textAlign="center">
            Last scanned: {result}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default QRCodeScanner;
