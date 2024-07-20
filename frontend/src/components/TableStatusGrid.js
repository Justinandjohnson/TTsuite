import React from 'react';
import { SimpleGrid, Box, Text } from '@chakra-ui/react';

const TableStatusBox = ({ table }) => (
  <Box
    borderWidth="2px"
    borderRadius="lg"
    p={4}
    textAlign="center"
    borderColor={table.status === 'Available' ? 'green.400' : 'blue.400'}
    bg="gray.800"
  >
    <Text fontSize="xl" fontWeight="bold">{`Table ${table.id}`}</Text>
    <Text color={table.status === 'Available' ? 'green.400' : 'blue.400'}>{table.status}</Text>
  </Box>
);

const TableStatusGrid = ({ tables }) => (
  <Box>
    <Text fontSize="3xl" fontWeight="bold" mb={4} color="teal.300">
      TABLE STATUS
    </Text>
    <SimpleGrid columns={[2, null, 3]} spacing={4}>
      {tables.map(table => (
        <TableStatusBox key={table.id} table={table} />
      ))}
    </SimpleGrid>
  </Box>
);

export default TableStatusGrid;