import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  //updateBooking,
  cancelBooking,
  //rescheduleBooking,
  getBookingHistory, fetchStylistsBySalonAndServices,
} from "../controllers/bookingController.js";

const router = express.Router();


// Booking management routes

// Create a booking by a user
router.post('/', requireAuth,  createBooking);                                              // POST {{base_url}}/api/booking
// Get all ongoing bookings of a user in the status of pending and confirmed
router.get('/', requireAuth, getUserBookings);                                             // GET {{base_url}}/api/booking (ongoing bookings)
// GET all bookings of a user without pending and confirmed ones                                
router.get('/history', requireAuth, getBookingHistory);                                    // GET {{base_url}}/api/booking/history
// Get a specific booking by ID for a one user - "may be" used in Boooking confirmed page                                                
router.get('/:bookingId', requireAuth, getBookingById);                                     // GET {{base_url}}/api/booking/:bookingId
// Edit a booking by a user can be able to edit booking service also - you can do it either do edit booking table in one route and change that books services in a another route / do both in one route
//router.put('/:bookingId', requireAuth, updateBooking);             // PUT {{base_url}}/api/booking/:bookingId
// cancel a booking by a user
router.put('/:bookingId', requireAuth, cancelBooking);      // PUT {{base_url}}/api/booking/:bookingId/cancel
// reschedule a booking by a user
//router.put('/:bookingId/reschedule', requireAuth, rescheduleBooking); // PUT {{base_url}}/api/booking/:bookingId/reschedule

// Get all stylists who can provide all those services
router.post('/eligible-stylists', fetchStylistsBySalonAndServices)

export default router;