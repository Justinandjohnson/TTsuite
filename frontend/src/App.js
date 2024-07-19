import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Queue from './components/Queue';
import TableManagement from './components/TableManagement';
import QRCodeScanner from './components/QRCodeScanner';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/tables" element={<TableManagement />} />
        <Route path="/scan" element={<QRCodeScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
