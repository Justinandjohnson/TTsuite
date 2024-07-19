import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ChakraProvider, Box, VStack, Heading } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Queue from './components/Queue';
import QRCodeScanner from './components/QRCodeScanner';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.100">
          <Navbar />
          <VStack spacing={8} p={8}>
            <Heading as="h1" size="2xl">Table Tennis Queue Management</Heading>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route path="/queue" component={Queue} />
              <Route path="/scan" component={QRCodeScanner} />
            </Switch>
          </VStack>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
