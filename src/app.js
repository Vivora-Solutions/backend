import express from 'express';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import salonRoutes from './routes/salonRoutes.js';

import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json()); 

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);




app.use('/api/salons',salonRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
