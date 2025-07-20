import express from 'express';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import salonAdminRoutes from './routes/salonAdminRoutes.js';
import supperAdminRoutes from './routes/supperAdminRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json()); 

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/salon-admin', salonAdminRoutes);


app.use('/api/protected', protectedRoutes);


app.use('/api/salons',salonRoutes);
app.use('/api/supper-admin', supperAdminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
