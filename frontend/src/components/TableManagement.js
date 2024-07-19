import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, VStack, HStack, Text, Button, Container, useToast } from '@chakra-ui/react';

function TableManagement() {
  const [tables, setTables] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tables');
        setTables(res.data);
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: "Error fetching tables",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchTables();
  }, [toast]);

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tables/${tableId}`, { status: newStatus });
      setTables(tables.map(table => 
        table.id === tableId ? { ...table, status: newStatus } : table
      ));
      toast({
        title: `Table ${tableId} status updated`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating table status:', error);
      toast({
        title: "Error updating table status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h2" size="2xl" mb={8} color="teal.300">Table Management</Heading>
      <VStack spacing={6} align="stretch">
        {tables.map(table => (
          <Box key={table.id} bg="gray.700" p={6} borderRadius="lg" boxShadow="lg">
            <VStack align="start" spacing={3}>
              <Heading as="h3" size="lg" color="teal.300">Table {table.id}</Heading>
              <Text fontSize="xl" color="white">Status: {table.status}</Text>
              <HStack spacing={4}>
                <Button 
                  colorScheme="green" 
                  onClick={() => updateTableStatus(table.id, 'available')}
                  isDisabled={table.status === 'available'}
                >
                  Set Available
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={() => updateTableStatus(table.id, 'occupied')}
                  isDisabled={table.status === 'occupied'}
                >
                  Set Occupied
                </Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Container>
  );
}

export default TableManagement;
