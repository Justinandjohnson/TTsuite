import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { Box, Text, VStack } from '@chakra-ui/react';

function QRCodeScanner() {
  const [result, setResult] = useState('No result');
  const [error, setError] = useState(null);

  const handleScan = async (data) => {
    if (data) {
      setResult('Processing...');
      try {
        const response = await axios.post('http://localhost:5000/api/queue', { qrCode: data });
        setResult(`Added to queue: ${response.data.name}`);
      } catch (error) {
        console.error('Error adding to queue:', error);
        setError('Failed to add to queue. Please try again.');
      }
    }
  };

  return (
    <Box maxWidth="400px" margin="auto">
      <VStack spacing={4}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              handleScan(result?.text);
            }

            if (!!error) {
              console.error(error);
              setError('Error reading QR code. Please try again.');
            }
          }}
          constraints={{ facingMode: 'environment' }}
          style={{ width: '100%' }}
        />
        <Text>{result}</Text>
        {error && <Text color="red.500">{error}</Text>}
      </VStack>
    </Box>
  );
}

export default QRCodeScanner;