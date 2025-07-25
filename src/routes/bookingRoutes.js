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

// Create a booking by a user
router.post('/', createBooking);                                              // POST {{base_url}}/api/booking      
// Get all ongoin bookings of a user in the status of pending and confirmed
router.get('/', getUserBookings);                                             // GET {{base_url}}/api/booking (ongoing bookings)
// GET all bookings of a user without pending and confirmed ones                                
router.get('/history', getBookingHistory);                                    // GET {{base_url}}/api/booking/history
// Get a specific booking by ID for a one user - "may be" used in Boooking confirmed page                                                
router.get('/:bookingId', getBookingById);                                     // GET {{base_url}}/api/booking/:bookingId 
// Edit a booking by a user can be able to edit booking service also - you can do it either do edit booking table in one route and change that books services in a another route / do both in one route
router.put('/:bookingId', updateBooking);             // PUT {{base_url}}/api/booking/:bookingId
// cancel a booking by a user
router.put('/:bookingId/cancel', cancelBooking);      // PUT {{base_url}}/api/booking/:bookingId/cancel
// reschedule a booking by a user
router.put('/:bookingId/reschedule', rescheduleBooking); // PUT {{base_url}}/api/booking/:bookingId/reschedule

export default router;