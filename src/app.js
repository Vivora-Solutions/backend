import express from 'express';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json()); 

// Routes
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
