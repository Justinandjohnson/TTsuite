# Table Tennis Queue Management System

This is a full-stack React application for managing table tennis queues.

## Setup

1. Set up MongoDB:
   - Open `backend/.env` and replace the MongoDB URI with your actual connection string.

2. Install dependencies:
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Start the backend server:
   ```
   cd backend && node server.js
   ```

4. Start the frontend development server:
   ```
   cd frontend && npm start
   ```

5. Run tests:
   ```
   cd backend && node test.js
   ```

## Usage

- Open a web browser and navigate to `http://localhost:3000` to use the application.
- The backend API is available at `http://localhost:5000`.

## Features

- Real-time table status updates
- Queue management
- QR code scanning for joining the queue
- Table management for staff
