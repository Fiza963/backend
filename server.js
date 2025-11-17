require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

// Initialize app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const evaluationRoutes = require('./routes/evaluations');
const adminRoutes = require('./routes/admin');
const teamRoutes = require('./routes/teams');
const leaderboardRoutes = require('./routes/leaderboard');
const chatRoutes = require('./routes/chat');

//routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io connection
const ChatMessage = require('./models/ChatMessage');
const User = require('./models/User');

io.on('connection', (socket) => {
  console.log('✔ User connected:', socket.id);

  socket.on('joinChat', async (userId) => {
    try {
      socket.join('support-room');
      socket.userId = userId;
      console.log(`User ${userId} joined support room`);
    } catch (error) {
      console.error('Join error:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    console.log(' Received message:', data);
    
    try {
      // Getting sender info
      const sender = await User.findById(data.senderId);
      if (!sender) {
        console.error('Sender not found');
        return;
      }

      // Creating message
      const message = new ChatMessage({
        sender: data.senderId,
        senderName: sender.name,
        senderRole: sender.role,
        message: data.message
      });
      
      await message.save();
      console.log(' Message saved:', message);

      // Preparing message with full data
      const messageData = {
        _id: message._id,
        sender: {
          _id: sender._id,
          name: sender.name,
          role: sender.role
        },
        message: message.message,
        createdAt: message.createdAt
      };

      // Broadcasting to everyone in support room
      io.to('support-room').emit('newMessage', messageData);
      console.log(' Message broadcast to support-room');
      
    } catch (error) {
      console.error(' Send message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` API: http://localhost:${PORT}/api`);
});