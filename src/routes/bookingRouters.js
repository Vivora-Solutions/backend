import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  rescheduleBooking,
  getBookingHistory
} from "../controllers/bookingController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Booking management routes
router.post('/', createBooking);                      // POST {{base_url}}/api/booking -  works
router.get('/', getUserBookings);                     // GET {{base_url}}/api/booking (ongoing bookings)-   works
router.get('/history', getBookingHistory);            // GET {{base_url}}/api/booking/history -   works
router.get('/:bookingId', getBookingById);            // GET {{base_url}}/api/booking/:bookingId    -works
router.put('/:bookingId', updateBooking);             // PUT {{base_url}}/api/booking/:bookingId
router.put('/:bookingId/cancel', cancelBooking);      // PUT {{base_url}}/api/booking/:bookingId/cancel
router.put('/:bookingId/reschedule', rescheduleBooking); // PUT {{base_url}}/api/booking/:bookingId/reschedule

export default router;