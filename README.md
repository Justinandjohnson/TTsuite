# 🏓 Table Tennis Queue Management System 🎉

Welcome to the Table Tennis Queue Management System! 

This full-stack React application helps manage table tennis queues efficiently and in real-time. Let's get the ball rolling! 🚀🏓

## ✨ Features

- Real-time table status updates 🔄 (never miss a free table!)
- Queue management with estimated wait times ⏱️ (know exactly when it's your turn)
- QR code scanning for joining the queue 📱 (quick and easy access)
- Table management for staff 👨‍💼👩‍💼 (efficient oversight)
- Responsive design for various devices 📱💻🖥️ (play anywhere, anytime)
- Interactive pong background animation 🎮 (nostalgia meets function)
- User authentication and profiles 🔐👤 (personalized experience)
- Leaderboard and statistics 🏆📊 (track your progress)

## 🛠️ Tech Stack

- **Frontend**: React ⚛️, Chakra UI 🎨, Socket.io-client 🔌
- **Backend**: Node.js 🟢, Express.js 🚂, Socket.io 🔌
- **Database**: MongoDB 🍃 (for flexible, scalable data storage)
- **State Management**: React Hooks 🎣 (for efficient component logic)
- **Styling**: Chakra UI 🎨 (for consistent and customizable UI components)
- **Testing**: Jest 🃏, Supertest 🦸‍♂️ (for robust, reliable code)
- **Authentication**: JWT 🔑 (for secure user sessions)
- **Deployment**: Docker 🐳, Heroku 🚀 (for easy scaling and deployment)

## 🚀 Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/table-tennis-queue-management.git
   cd table-tennis-queue-management
   ```

2. Set up MongoDB:
   - Open `backend/.env` and replace the MongoDB URI with your actual connection string.
   - Ensure your MongoDB instance is running 🏃‍♂️

3. Install dependencies:
   ```
   npm install
   ```

4. Start the application (both backend and frontend):
   ```
   npm start
   ```

5. Run tests to ensure everything is working:
   ```
   npm test
   ```

## 📊 Usage

- Open a web browser and navigate to `http://localhost:3000` to use the application.
- The backend API is available at `http://localhost:5000`.
- Sign up or log in to access all features 🔐
- Join a queue, check table status, and enjoy your game! 🏓

### Detailed Usage Guide

1. **Sign Up/Login**: Create an account or log in to access all features.

2. **View Table Status**: Check the real-time status of all tables on the main dashboard.

3. **Join a Queue**:
   - Scan the QR code displayed near each table using your device's camera.
   - Alternatively, enter the table ID manually in the app.
   - You'll see your position in the queue and estimated wait time.

4. **Manage Your Queue Position**:
   - Receive notifications as you move up in the queue.
   - Option to leave the queue if needed.

5. **Start Playing**:
   - When it's your turn, you'll receive a notification.
   - Confirm your readiness to play within a set time limit.

6. **Staff Features**:
   - Staff members can log in to access additional management options.
   - Update table status (available, occupied, out of order).
   - Override queue order if necessary.

7. **View Leaderboard**: Check your ranking and stats against other players.

8. **Profile Management**: Update your profile, view your play history, and track your progress.

Remember to respect the queue system and have fun! 🏓😄

## 📚 API Endpoints

- **GET /tables**: Retrieve a list of all tables with their current status. 🏓
- **POST /joinQueue**: Join the queue by scanning a QR code or entering a table ID. 🧍‍♂️🧍‍♀️
- **GET /queue**: Get the current queue with estimated wait times. ⏳
- **PUT /updateTableStatus**: Update the status of a table (staff only). 🔄
- **GET /staff**: Retrieve a list of staff members. 👥
- **POST /auth/login**: Authenticate a user and receive a JWT. 🔑
- **GET /user/profile**: Retrieve user profile information. 👤
- **GET /leaderboard**: Get the current leaderboard. 🏆

## 🤝 Contributing

Contributions are welcome! If you find any bugs 🐛 or have ideas for new features 💡, please open an issue or submit a pull request. Let's make table tennis queuing a breeze together! 🌬️🏓

## 📝 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute as you see fit! 🆓

## 📚 Learn More

Dive deeper into the technologies used in this project:

### 📹 Related YouTube Videos

- [React Crash Course 2021](https://www.youtube.com/watch?v=w7ejDZ8SWv8) 🔥
- [Socket.io Tutorial for Real-time Communication](https://www.youtube.com/watch?v=ZKEqqIO7n-k) 🔌
- [Chakra UI Tutorial for React](https://www.youtube.com/watch?v=wI2vqXsjsIo) 🎨
- [MongoDB Tutorial for Node.js](https://www.youtube.com/watch?v=-56x56UppqQ) 🍃
- [JWT Authentication Tutorial](https://www.youtube.com/watch?v=7Q17ubqLfaM) 🔐
- [Docker Tutorial for Deployment](https://www.youtube.com/watch?v=fqMOX6JJhGo) 🐳
- [Heroku Deployment Tutorial](https://www.youtube.com/watch?v=7d5mhrx9h1c) 🚀
