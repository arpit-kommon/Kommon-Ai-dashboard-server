import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mongoose from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import SchedulerService from './services/schedulerService.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import userGuideRoutes from './routes/userGuideRoutes.js';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(express.json());
dotenv.config();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
app.use('/v1/api/schedules', scheduleRoutes);
app.use('/v1/api/user-guide', userGuideRoutes);
app.use(errorMiddleware);
app.get('/', (req, res) => {
  res.send('Server is ON');
});

// Function to fetch schedules from the API
async function fetchUserSchedules() {
  try {
    const response = await axios.get('http://localhost:3000/v1/api/schedules/get');
    if (response.data.status !== 'OK') {
      throw new Error(response.data.message || 'Failed to fetch schedules');
    }

    const schedules = response.data.data;
    schedules.sort((a, b) => new Date(a.time) - new Date(b.time));
    
    return schedules.map(schedule => ({
      userId: schedule.userId,
      time: new Date(schedule.time),
      apiId: schedule._id
    }));
  } catch (error) {
    console.error('Error fetching schedules from API:', error.message);
    return [];
  }
}

async function startApp() {
  const scheduler = new SchedulerService();
  let activeSchedules = []; // Local array to store active future schedules

  scheduler.setCustomCallback(async (currentTime, userId) => {
    console.log(`Custom function executed at: ${currentTime.toISOString()} for user: ${userId}`);
    try {
      io.to(userId).emit('notification', {
        message: `Your exclusive update is here! - ${currentTime.toLocaleTimeString()}`,
        status: 'success',
        executedAt: currentTime
      });
      return {
        status: 'success',
        executedAt: currentTime
      };
    } catch (error) {
      console.error(`Notification failed for user ${userId}:`, error.message);
      io.to(userId).emit('notification', {
        message: `Notification failed for ${userId} at ${currentTime.toLocaleTimeString()}`,
        status: 'error',
        executedAt: currentTime,
        error: error.message
      });
      return {
        status: 'error',
        executedAt: currentTime,
        error: error.message
      };
    }
  });

  function scheduleExactTask(userId, executionTime, apiId) {
    const currentTime = new Date();
    const timeDiff = executionTime - currentTime;

    if (timeDiff <= 0) {
      console.log(`Task ${apiId} for user ${userId} at ${executionTime.toISOString()} is in the past, skipping`);
      return;
    }

    const existingTask = activeSchedules.find(t => t.id === apiId);
    if (existingTask) {
      console.log(`Task ${apiId} for user ${userId} already scheduled, skipping`);
      return;
    }

    const task = {
      id: apiId,
      userId,
      executionTime,
      isExecuted: false,
      timeoutId: setTimeout(async () => {
        const now = new Date();
        const result = await scheduler.scheduledFunction(now, userId);
        task.isExecuted = true;
        task.executedAt = result.executedAt || now;
        task.lastRunTime = now;
        console.log(`Task ${apiId} for user ${userId} executed successfully at ${now.toISOString()}`);
        activeSchedules = activeSchedules.filter(t => t.id !== apiId);
      }, timeDiff)
    };

    activeSchedules.push(task);
    console.log(`Task ${apiId} scheduled for user ${userId} at ${executionTime.toISOString()}`);
  }

  async function refreshSchedules() {
    const currentTime = new Date();
    const userSchedules = await fetchUserSchedules();

    if (userSchedules.length === 0) {
      console.log('No schedules found from API on refresh');
      activeSchedules.forEach(task => {
        if (!task.isExecuted) clearTimeout(task.timeoutId);
      });
      activeSchedules = [];
      scheduler.clearTasks();
      return;
    }

    // Only clear timeouts for tasks no longer in the API data
    const newTaskIds = new Set(userSchedules.map(s => s.apiId));
    activeSchedules.forEach(task => {
      if (!newTaskIds.has(task.id) && !task.isExecuted) {
        clearTimeout(task.timeoutId);
        console.log(`Cleared task ${task.id} for user ${task.userId} as it’s no longer in API data`);
      }
    });

    // Update activeSchedules, keeping executed tasks until refresh confirms removal
    activeSchedules = activeSchedules.filter(task => task.isExecuted || newTaskIds.has(task.id));
    const existingTaskIds = new Set(activeSchedules.map(t => t.id));

    // Schedule new future tasks
    let newTaskCount = 0;
    for (const { userId, time, apiId } of userSchedules) {
      if (time > currentTime && !existingTaskIds.has(apiId)) {
        scheduleExactTask(userId, time, apiId);
        newTaskCount++;
      } else if (time <= currentTime) {
        console.log(`Skipped past schedule for user ${userId} at ${time.toISOString()}`);
      }
    }

    console.log(`Refreshed at ${currentTime.toISOString()}: Scheduled ${newTaskCount} future tasks`);
  }

  scheduler.start();
  await refreshSchedules();

  const refreshIntervalMs = 30 * 1000; // 30 seconds
  setInterval(async () => {
    await refreshSchedules();
  }, refreshIntervalMs);

  setTimeout(() => {
    console.log('Initial tasks:', activeSchedules);
  }, 500);
}

// Start server and app
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startApp().catch(error => console.error('App failed to start:', error));
});