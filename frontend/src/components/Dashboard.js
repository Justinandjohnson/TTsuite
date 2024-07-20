import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Heading, Container, Box, Text, VStack, HStack, Badge, Button, Input, useToast, Stat, StatLabel, StatNumber, Table, Thead, Tbody, Tr, Th, Td, Select, FormControl, FormLabel, SimpleGrid, Switch, Flex, Circle, AspectRatio } from '@chakra-ui/react';
import TableStatusGrid from './TableStatusGrid';
import AssignPlayerModal from './playerAssignment';

function Dashboard() {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const toast = useToast();

  const assignPlayerToTable = useCallback(async (tableId, playerId) => {
    try {
      const player = queue.find(p => p._id === playerId);
      if (!player) {
        throw new Error('Player not found in queue');
      }
      
      const response = await axios.put(`http://localhost:5000/api/tables/${tableId}`, { 
        playerId: player._id
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to update table status');
      }
      
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
        description: error.response?.data?.message || error.message || "Failed to assign player to table",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [queue, setTables, setQueue, toast]);

  const autoAssignPlayers = useCallback(async () => {
    const availableTables = tables.filter(table => table.status === 'available');
    const playersToAssign = queue.slice(0, availableTables.length);

    for (let i = 0; i < playersToAssign.length; i++) {
      const player = playersToAssign[i];
      const table = availableTables[i];

      if (window.confirm(`Assign ${player.name} to Table ${table.id}?`)) {
        await assignPlayerToTable(table.id, player._id);
      }
    }
  }, [tables, queue, assignPlayerToTable]);

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

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isAutoMode) {
      const interval = setInterval(autoAssignPlayers, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAutoMode, autoAssignPlayers]);

  const getStatusColor = (status) => {
    return status === 'available' ? 'green.400' : 'red.400';
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

  const addTable = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/tables', { status: 'available' });
      const newTable = response.data;
      setTables([...tables, newTable]);
  
      toast({
        title: "Success",
        description: `Added new table: Table ${newTable.id}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: "Error",
        description: "Failed to add new table. Please try again.",
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

  const resetData = async () => {
    try {
      await axios.post('http://localhost:5000/api/reset');
      setTables([]);
      setQueue([]);
      toast({
        title: "Reset Successful",
        description: "All data has been reset.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Error",
        description: "Failed to reset data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
          <Switch
            id="auto-mode"
            onChange={(e) => setIsAutoMode(e.target.checked)}
            isChecked={isAutoMode}
          />
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
                    {table.currentPlayers.map(player => player.name).join(', ')}
                    {table.currentPlayers.length < table.capacity && ` (${table.currentPlayers.length}/${table.capacity})`}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        disabled={table.currentPlayers.length >= table.capacity}
                      >
                        <option value="">Select player</option>
                        {queue.map((player) => (
                          <option key={player._id} value={player._id}>
                            {player.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        colorScheme="teal"
                        onClick={() => assignPlayerToTable(table.id, selectedPlayer)}
                        isDisabled={!selectedPlayer || table.currentPlayers.length >= table.capacity}
                      >
                        Assign
                      </Button>
                      <Button
                        colorScheme="red"
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
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4} color="teal.300">
            TABLE STATUS
          </Text>
          <Button colorScheme="green" onClick={addTable} mb={4}>
            Add New Table
          </Button>
          <SimpleGrid columns={3} spacing={4} mb={8}>
            {tables.map((table) => (
              <AspectRatio key={table.id} ratio={1} width="150px" maxWidth="100%">
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg"
                  overflow="hidden"
                  position="relative"
                  backgroundImage="url('/images/ping-pong.gif')"
                  backgroundSize="cover"
                  backgroundPosition="center"
                  backgroundRepeat="no-repeat"
                >
                  <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    height="100%" 
                    width="100%"
                    bg="rgba(0,0,0,0.5)"  // Semi-transparent overlay
                    position="absolute"
                    top="0"
                    left="0"
                  >
                    <Text color="white" fontSize="lg" fontWeight="bold">{table.currentPlayers[0]?.name || "Available"}</Text>
                    {table.currentPlayers.length > 0 && <Text color="white" fontSize="lg" fontWeight="bold">vs</Text>}
                    <Text color="white" fontSize="lg" fontWeight="bold">
                      {table.currentPlayers[1]?.name || (table.currentPlayers.length === 1 ? "Waiting..." : "")}
                    </Text>
                  </Flex>
                  <Circle size="24px" bg="teal.500" color="white" position="absolute" bottom="2" right="2">
                    <Text fontSize="xs">{table.id}</Text>
                  </Circle>
                </Box>
              </AspectRatio>
            ))}
          </SimpleGrid>
        </Box>
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
                  {tables.filter(t => t.status === 'available' && t.currentPlayers.length < t.capacity).map((table) => (
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
        <Button colorScheme="red" onClick={resetData} mt={4}>
          Reset All Data
        </Button>
      </Box>
    </Container>
  );
}

export default Dashboard;