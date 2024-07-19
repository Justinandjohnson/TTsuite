import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Grid, Heading, Container, Box, Text, VStack, HStack, Badge, Button, Input, useToast, Stat, StatLabel, StatNumber, Table, Thead, Tbody, Tr, Th, Td, Select, Switch, FormControl, FormLabel } from '@chakra-ui/react';

function Dashboard() {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesRes, queueRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tables'),
          axios.get('http://localhost:5000/api/queue')
        ]);
        setTables(tablesRes.data);
        setQueue(queueRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    const socket = io('http://localhost:5000');
    socket.on('tableUpdate', (updatedTables) => {
      setTables(updatedTables);
    });
    socket.on('queueUpdate', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (isAutoMode) {
      const interval = setInterval(autoAssignPlayers, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAutoMode, tables, queue]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'occupied':
        return 'red';
      default:
        return 'gray';
    }
  };

  const addPlayerToQueue = async () => {
    if (!newPlayerName || !newPlayerPhone) {
      toast({
        title: "Error",
        description: "Please enter both name and phone number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/queue', { name: newPlayerName, phone: newPlayerPhone });
      setNewPlayerName('');
      setNewPlayerPhone('');
      toast({
        title: "Success",
        description: `Player added to the queue. Position: ${response.data.position}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Fetch updated queue
      const updatedQueueRes = await axios.get('http://localhost:5000/api/queue');
      setQueue(updatedQueueRes.data);
    } catch (error) {
      console.error('Error adding player to queue:', error);
      console.error('Error response:', error.response);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to add player to the queue.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const assignPlayerToTable = async (tableId, playerId) => {
    if (!playerId) {
      toast({
        title: "Error",
        description: "No player selected",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const player = queue.find(p => p._id === playerId);
      await axios.put(`http://localhost:5000/api/tables/${tableId}`, { 
        status: 'occupied', 
        players: [player.name]
      });
      await axios.delete(`http://localhost:5000/api/queue/${player._id}`);
      
      // Fetch updated tables and queue
      const [tablesRes, queueRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tables'),
        axios.get('http://localhost:5000/api/queue')
      ]);
      setTables(tablesRes.data);
      setQueue(queueRes.data);
      
      toast({
        title: "Success",
        description: `Assigned ${player.name} to Table ${tableId}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error assigning player to table:', error);
      toast({
        title: "Error",
        description: "Failed to assign player to table",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const addTable = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/tables', { status: 'available' });
      setTables([...tables, response.data]);
      toast({
        title: "Success",
        description: `Added new table: Table ${response.data.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: "Error",
        description: "Failed to add new table",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeTable = async (tableId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tables/${tableId}`);
      setTables(tables.filter(table => table.id !== tableId));
      toast({
        title: "Success",
        description: `Removed Table ${tableId}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing table:', error);
      toast({
        title: "Error",
        description: "Failed to remove table",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const autoAssignPlayers = async () => {
    const availableTables = tables.filter(table => table.status === 'available');
    const playersToAssign = queue.slice(0, availableTables.length);

    for (let i = 0; i < playersToAssign.length; i++) {
      const player = playersToAssign[i];
      const table = availableTables[i];

      if (window.confirm(`Assign ${player.name} to Table ${table.id}?`)) {
        await assignPlayerToTable(table.id, player._id);
      }
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="rgba(0,0,0,0.8)" p={6} borderRadius="md" boxShadow="xl">
        <Heading as="h1" size="2xl" textAlign="center" mb={8} color="teal.300">
          Table Tennis Dashboard
        </Heading>
        <FormControl display="flex" alignItems="center" mb={4}>
          <FormLabel htmlFor="auto-mode" mb="0" color="white">
            Auto Mode
          </FormLabel>
          <Switch id="auto-mode" onChange={(e) => setIsAutoMode(e.target.checked)} />
        </FormControl>
        <Box overflowX="auto">
          <Table variant="simple" colorScheme="teal" mb={8}>
            <Thead>
              <Tr>
                <Th color="teal.300">Table</Th>
                <Th color="teal.300">Status</Th>
                <Th color="teal.300">Players</Th>
                <Th color="teal.300">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tables.map((table) => (
                <Tr key={table.id}>
                  <Td color="white">Table {table.id}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </Td>
                  <Td color="white">
                    {table.players.length > 0 ? table.players.join(', ') : 'Free'}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Select
                        placeholder="Select player"
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        bg="gray.700"
                        color="white"
                        size="sm"
                      >
                        {queue.map((player) => (
                          <option key={player._id} value={player._id}>
                            {player.name}
                          </option>
                        ))}
                      </Select>
                      <Button 
                        colorScheme="teal" 
                        size="sm"
                        onClick={() => assignPlayerToTable(table.id, selectedPlayer)}
                        isDisabled={table.status === 'occupied' || queue.length === 0}
                      >
                        Assign
                      </Button>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => removeTable(table.id)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Button colorScheme="green" mb={8} onClick={addTable}>
          Add New Table
        </Button>
        <Box bg="gray.800" p={6} borderRadius="md" boxShadow="lg" mb={8}>
          <Heading as="h3" size="lg" mb={4} color="teal.300">Queue Statistics</Heading>
          <HStack spacing={8} justify="center">
            <Stat>
              <StatLabel color="gray.400">Total in Queue</StatLabel>
              <StatNumber color="white">{queue.length}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.400">Estimated Wait for Next</StatLabel>
              <StatNumber color="white">{queue.length > 0 ? `${queue[0].estimatedWaitTime} min` : 'N/A'}</StatNumber>
            </Stat>
          </HStack>
        </Box>
        <Heading as="h2" size="xl" textAlign="center" mt={8} mb={4} color="teal.300">
          Queue
        </Heading>
        <VStack spacing={4} align="stretch" mb={8}>
          {queue.map((player, index) => (
            <Box key={player._id} bg="gray.800" p={4} borderRadius="md" boxShadow="lg" border="1px" borderColor="gray.700">
              <HStack justifyContent="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {index + 1}. {player.name}
                  </Text>
                  <Text fontSize="sm" color="gray.400">{player.phone}</Text>
                </VStack>
                <Select
                  placeholder="Assign to table"
                  onChange={(e) => assignPlayerToTable(e.target.value, player._id)}
                  bg="gray.700"
                  color="white"
                  size="sm"
                  width="auto"
                >
                  {tables.filter(t => t.status === 'available').map((table) => (
                    <option key={table.id} value={table.id}>
                      Table {table.id}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Box>
          ))}
        </VStack>
        <Box bg="gray.800" p={4} borderRadius="md" boxShadow="lg" border="1px" borderColor="gray.700">
          <Heading as="h3" size="md" mb={4} color="teal.300">
            Add Player to Queue
          </Heading>
          <VStack spacing={4}>
            <Input
              placeholder="Player Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              bg="gray.700"
              color="white"
            />
            <Input
              placeholder="Phone Number"
              value={newPlayerPhone}
              onChange={(e) => setNewPlayerPhone(e.target.value)}
              bg="gray.700"
              color="white"
            />
            <Button colorScheme="teal" onClick={addPlayerToQueue}>
              Add to Queue
            </Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard;
