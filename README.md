# Table Tennis Queue Management System

This is a full-stack React application for managing table tennis queues.

## Setup

1. Set up MongoDB:
   - Open `backend/.env` and replace the MongoDB URI with your actual connection string.

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application (both backend and frontend):
   ```
   npm start
   ```

4. Run tests:
   ```
   npm test
   ```

## Usage

- Open a web browser and navigate to `http://localhost:3000` to use the application.
- The backend API is available at `http://localhost:5000`.

## Features

- Real-time table status updates
- Queue management
- QR code scanning for joining the queue
- Table management for staff
- Hot reloading for both frontend and backend

## Development

The application uses `nodemon` for the backend and Create React App's built-in hot reloading for the frontend. Any changes you make to the code will automatically trigger a reload of the affected parts of the application.
