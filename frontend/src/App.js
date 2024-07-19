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
          <video
            autoPlay
            loop
            muted
            style={{
              position: 'absolute',
              width: '100%',
              left: '50%',
              top: '50%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
              zIndex: '-1'
            }}
          >
            <source src="/pong-background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
