import React from 'react';
import { Box, Text, Badge } from '@chakra-ui/react';

function TableStatus({ table }) {
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
