import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Queue from './components/Queue';
import TableManagement from './components/TableManagement';
import QRCodeScanner from './components/QRCodeScanner';

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
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;