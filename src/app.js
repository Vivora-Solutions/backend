// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
//
// import authRoutes from './routes/authRoutes.js';
// import salonAdminRoutes from './routes/salonAdminRoutes.js';
// import supperAdminRoutes from './routes/supperAdminRoutes.js';
// //import bookingRoutes from './routes/bookingRoutes.js'
// import salonRoutes from './routes/salonRoutes.js';
// import reviewRoutes from './routes/reviewRoutes.js';
//
// import dotenv from 'dotenv';
//
// dotenv.config();
//
// const app = express();
//
// app.use(express.json());
// app.use(express.json());
// app.use(cookieParser());
//
//
// const corsOptions = {
//   origin: 'http://localhost:5173', // ✅ Replace with your frontend URL (Vite, React etc.)
//   credentials: true,              // ✅ Allow cookies to be sent
// };
//
// app.use(cors(corsOptions));
//
// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/salon-admin', salonAdminRoutes);
// app.use('/api/salons', salonRoutes);
// //app.use('/api/booking', bookingRoutes); //booking routes for users, booking routes for salon admin includes at salon-admin routes
// app.use('/api/review', reviewRoutes);
//
// app.get('/', (req, res) => {
//   res.send('API is running...');
// });
//
// export default app;
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import salonAdminRoutes from './routes/salonAdminRoutes.js';
import supperAdminRoutes from './routes/supperAdminRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

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

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
