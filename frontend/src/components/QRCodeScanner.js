import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
import axios from 'axios';

function QRCodeScanner() {
  const [result, setResult] = useState('');

  const handleScan = async (data) => {
    if (data) {
      setResult(data);
      try {
        const playerInfo = JSON.parse(data);
        await axios.post('http://localhost:5000/api/queue', playerInfo);
        alert('Successfully added to queue!');
      } catch (error) {
        console.error('Error adding to queue:', error);
        alert('Failed to add to queue. Please try again.');
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <h2>Scan QR Code to Join Queue</h2>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
      <p>{result}</p>
    </div>
  );
}

export default QRCodeScanner;
