import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Grid, Box, Heading, Text, Badge } from '@chakra-ui/react';

const socket = io('http://localhost:5000');

import React from 'react';
import { Box, Text, Badge } from '@chakra-ui/react';

function TableStatus({ table }) {

    return () => {
      socket.off('tableUpdate');
    };
  }, []);

  return (
    <Box w="100%">
      <Heading as="h2" size="xl" mb={6}>Table Status</Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {tables.map(table => (
          <Box key={table.id} bg="white" p={4} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="md" mb={2}>Table {table.id}</Heading>
            <Badge colorScheme={table.status === 'available' ? 'green' : 'red'} mb={2}>
              {table.status}
            </Badge>
            <Text>Players: {table.players.join(', ') || 'None'}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Text fontSize="xl" fontWeight="bold">
        Table {table.id}
      </Text>
      <Badge colorScheme={table.status === 'available' ? 'green' : 'red'}>
        {table.status}
      </Badge>
      {table.players.length > 0 && (
        <Text mt={2}>
          Players: {table.players.join(', ')}
        </Text>
      )}
    </Box>
  );
}

export default TableStatus;
