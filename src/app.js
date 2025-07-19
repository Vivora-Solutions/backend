// src/app.js
import express from 'express';
//import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // for parsing application/json

// Routes
//app.use('/api/users', userRoutes);

// Health check route (optional)
app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
