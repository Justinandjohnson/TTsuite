import React from 'react';
import { Box, Text, Badge, VStack } from '@chakra-ui/react';

function TableStatus({ table }) {
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={6} 
      bg="gray.700" 
      boxShadow="lg"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
    >
      <VStack align="start" spacing={3}>
        <Text fontSize="2xl" fontWeight="bold" color="teal.300">
          Table {table.id}
        </Text>
        <Badge 
          colorScheme={table.status === 'available' ? 'green' : 'red'}
          fontSize="md"
          px={2}
          py={1}
          borderRadius="full"
        >
          {table.status}
        </Badge>
        {table.players.length > 0 && (
          <Text mt={2} color="gray.300">
            Players: {table.players.join(', ')}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default TableStatus;
