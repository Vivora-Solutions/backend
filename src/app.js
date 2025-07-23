import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import BookingRouters from './routes/bookingRouters.js'
import salonAdminRoutes from './routes/salonAdminRoutes.js';
import supperAdminRoutes from './routes/supperAdminRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/salon-admin', salonAdminRoutes);
app.use('/api/booking', BookingRouters);
app.use ('/api/user',userRoutes);
app.use('/api/salons',salonRoutes);
app.use('/api/supper-admin', supperAdminRoutes);
// app.use('/api/booking', bookingRoutes);
app.use('/api/review', reviewRoutes);
app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
