import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Queue from './components/Queue';
import TableManagement from './components/TableManagement';
import QRCodeScanner from './components/QRCodeScanner';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Dashboard />
      </>
    ),
  },
  {
    path: "/queue",
    element: (
      <>
        <Navbar />
        <Queue />
      </>
    ),
  },
  {
    path: "/tables",
    element: (
      <>
        <Navbar />
        <TableManagement />
      </>
    ),
  },
  {
    path: "/scan",
    element: (
      <>
        <Navbar />
        <QRCodeScanner />
      </>
    ),
  },
]);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" bg="gray.900">
        <RouterProvider router={router} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
