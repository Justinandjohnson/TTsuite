import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
  });

  test('renders Navbar', () => {
    render(<App />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Queue')).toBeInTheDocument();
  });

  test('fetches and displays tables', async () => {
    const mockTables = [
      { id: 1, status: 'available', players: [] },
      { id: 2, status: 'occupied', players: ['Player 1', 'Player 2'] },
    ];
    axios.get.mockResolvedValueOnce({ data: mockTables });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Table 1')).toBeInTheDocument();
      expect(screen.getByText('Table 2')).toBeInTheDocument();
    });
  });
});

// Add more test files for individual components:

// QueueTest.js
describe('Queue Component', () => {
  test('displays queue items', async () => {
    const mockQueue = [
      { _id: '1', name: 'Player 1', position: 1 },
      { _id: '2', name: 'Player 2', position: 2 },
    ];
    axios.get.mockResolvedValueOnce({ data: mockQueue });

    render(<Queue />);

    await waitFor(() => {
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });
  });

  test('removes player from queue', async () => {
    const mockQueue = [{ _id: '1', name: 'Player 1', position: 1 }];
    axios.get.mockResolvedValueOnce({ data: mockQueue });
    axios.delete.mockResolvedValueOnce({});

    render(<Queue />);

    await waitFor(() => {
      userEvent.click(screen.getByText('Remove'));
    });

    expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/api/queue/1');
  });
});

// TableManagementTest.js
describe('TableManagement Component', () => {
  test('updates table status', async () => {
    const mockTables = [{ id: 1, status: 'available', players: [] }];
    const setTables = jest.fn();

    render(<TableManagement tables={mockTables} setTables={setTables} />);

    axios.put.mockResolvedValueOnce({ status: 200, data: { id: 1, status: 'occupied', players: ['Player 1'] } });

    userEvent.click(screen.getByText('Set Occupied'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('http://localhost:5000/api/tables/1', {
        status: 'occupied',
        players: ['Player 1'],
      });
    });
  });
});

// Add more component tests as needed
