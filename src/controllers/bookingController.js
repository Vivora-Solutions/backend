import {
  handleGetUserBookings,
  handleGetBookingById,
  handleUpdateBooking,
  handleCancelBooking,
  handleRescheduleBooking,
  handleGetBookingHistory, getStylistsForAllServices,
  //handleCreateBookingWithServices
} from '../services/bookingService.js'

// controllers/bookingController.js
import { handleCreateBooking, handleDeleteBooking } from '../services/bookingService.js';

export const createBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id , service_ids, booking_start_datetime, notes } = req.body;

    if (!user_id || !service_ids || !booking_start_datetime || !stylist_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleCreateBooking(user_id, stylist_id, service_ids, booking_start_datetime, notes);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const result = await handleDeleteBooking(user_id, booking_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    const result = await handleGetUserBookings(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!bookingId) return res.status(400).json({ error: 'Booking ID is required' });
    
    const result = await handleGetBookingById(user_id, bookingId);
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    const updateData = req.body;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!bookingId) return res.status(400).json({ error: 'Booking ID is required' });
    
    const result = await handleUpdateBooking(user_id, bookingId, updateData);
    if (!result) return res.status(404).json({ error: 'Booking not found or cannot be updated' });
    
    res.status(200).json({ message: 'Booking updated successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!bookingId) return res.status(400).json({ error: 'Booking ID is required' });
    
    const result = await handleCancelBooking(user_id, bookingId);
    if (!result) return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    
    res.status(200).json({ message: 'Booking cancelled successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rescheduleBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    const { booking_start_datetime, booking_end_datetime } = req.body;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!bookingId) return res.status(400).json({ error: 'Booking ID is required' });
    if (!booking_start_datetime || !booking_end_datetime) {
      return res.status(400).json({ error: 'booking_start_datetime and booking_end_datetime are required for rescheduling' });
    }
    
    const result = await handleRescheduleBooking(user_id, bookingId, booking_start_datetime, booking_end_datetime);
    if (!result) return res.status(404).json({ error: 'Booking not found or cannot be rescheduled' });
    
    res.status(200).json({ message: 'Booking rescheduled successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const user_id = req.userId;
    const { page = 1, limit = 10 } = req.query;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    const result = await handleGetBookingHistory(user_id, parseInt(page), parseInt(limit));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const fetchStylistsBySalonAndServices = async (req, res) => {
  const { salonId, serviceIds } = req.body;

  if (!salonId || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({
      error: 'salonId and non-empty serviceIds array are required in the body.',
    });
  }

  try {
    const stylists = await getStylistsForAllServices(salonId, serviceIds);
    return res.status(200).json({ success: true, data: stylists });
  } catch (error) {
    console.error('Error fetching eligible stylists:', error.message);
    return res.status(500).json({ error: 'Failed to fetch eligible stylists.' });
  }
};




