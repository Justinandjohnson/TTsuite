import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ChakraProvider, Box, VStack, Heading } from '@chakra-ui/react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Queue from './components/Queue';
import QRCodeScanner from './components/QRCodeScanner';
import TableManagement from './components/TableManagement';

function App() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      const res = await axios.get('http://localhost:5000/api/tables');
      setTables(res.data);
    };
    fetchTables();
  }, []);

  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.100">
          <Navbar />
          <VStack spacing={8} p={8}>
            <Heading as="h1" size="2xl">Table Tennis Queue Management</Heading>
            <Switch>
              <Route exact path="/" render={() => <Dashboard tables={tables} />} />
              <Route path="/queue" component={Queue} />
              <Route path="/scan" component={QRCodeScanner} />
              <Route path="/manage" render={() => <TableManagement tables={tables} setTables={setTables} />} />
            </Switch>
          </VStack>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;