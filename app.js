import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mongoose from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import cors from 'cors';

const app = express();
app.use(express.json());
dotenv.config();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend origin
    methods: ['GET', 'POST'],        // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true                // If you use cookies/auth
  }
});

app.use(cors({
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.set('socketio', io);

// WebSocket setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/v1/api', userRoutes);
app.use('/v1/api/notifications', notificationRoutes);
app.use(errorMiddleware);
app.get('/', (req, res) => {
  res.send('Server is ON');
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});