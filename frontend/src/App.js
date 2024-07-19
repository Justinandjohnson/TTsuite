import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Queue from './components/Queue';
import TableManagement from './components/TableManagement';
import QRCodeScanner from './components/QRCodeScanner';
import SignIn from './components/SignIn';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'transparent',
        color: 'white',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box
          minHeight="100vh"
          position="relative"
          overflow="hidden"
        >
          <iframe
            src="/pong-background.html"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: 'none',
              zIndex: '-1'
            }}
            title="Pong Background"
          ></iframe>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/tables" element={<TableManagement />} />
            <Route path="/scan" element={<QRCodeScanner />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
