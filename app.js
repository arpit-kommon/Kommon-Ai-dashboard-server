import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from './db/db.js'; // Fixed
import userRoutes from './routes/userRoutes.js'; // Fixed
import errorMiddleware from './middleware/errorMiddleware.js'; // Fixed
import cors from 'cors';
// import mongoose from './db/db.js';


// ===========================configiration files================================================
const app = express();
app.use(express.json());
dotenv.config();
const server = http.createServer(app);

app.use(cors({
    origin: 'http://localhost:5173', // Adjust to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }));

// ===========================configiration files====================================
// ==============================routes defines======================================
app.use(errorMiddleware); // Fixed
app.use('/uploads', express.static('uploads'));
app.use('/v1/api', userRoutes);
app.get('/',(req,res)=>{
    res.send('server is ON');
})
// ==============================routes defines==================================================

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})