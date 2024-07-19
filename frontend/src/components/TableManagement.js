import React from 'react';
import { Box, Heading, SimpleGrid, Button, Select, useToast } from '@chakra-ui/react';
import axios from 'axios';

function TableManagement({ tables, setTables }) {
  const toast = useToast();

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tables/${tableId}`, {
        status: newStatus,
        players: newStatus === 'available' ? [] : tables.find(t => t.id === tableId).players
      });
      
      if (response.status === 200) {
        toast({
          title: "Table status updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      toast({
        title: "Error updating table status",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box w="100%">
      <Heading as="h2" size="xl" mb={6}>Table Management</Heading>
      <SimpleGrid columns={3} spacing={6}>
        {tables.map(table => (
          <Box key={table.id} p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading fontSize="xl" mb={4}>Table {table.id}</Heading>
            <Select 
              value={table.status} 
              onChange={(e) => updateTableStatus(table.id, e.target.value)}
              mb={4}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </Select>
            <Button 
              colorScheme={table.status === 'available' ? 'green' : 'red'} 
              onClick={() => updateTableStatus(table.id, table.status === 'available' ? 'occupied' : 'available')}
              width="100%"
            >
              {table.status === 'available' ? 'Mark Occupied' : 'Mark Available'}
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default TableManagement;
