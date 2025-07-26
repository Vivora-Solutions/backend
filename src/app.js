import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import salonAdminRoutes from './routes/salonAdminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();

// ✅ Proper CORS setup to allow cookies
const corsOptions = {
  origin: 'http://localhost:5173', // your frontend origin
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/salon-admin', salonAdminRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
