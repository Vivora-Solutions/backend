import {
    handleCreateBooking,
    handleUpdateBooking,
    handleDeleteBooking,
} from '../services/salonAdminBookingRelatedService.js';


export const createBooking = async (req, res) => {
  try {
    const user_id = req.userId; // injected from requireAuth middleware
    const { service_ids, booking_start_datetime, notes } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
    }

    if (!Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({ error: 'At least one service must be selected.' });
    }

    if (!booking_start_datetime) {
      return res.status(400).json({ error: 'Booking start datetime is required.' });
    }

    const result = await handleCreateBooking(user_id, service_ids, booking_start_datetime, notes);
    res.status(201).json(result);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};


export const updateBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    const updateData = req.body;

    if (!user_id || !bookingId || !updateData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleUpdateBooking(user_id, bookingId, updateData);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;

    if (!user_id || !bookingId) {
      return res.status(400).json({ error: 'Missing user or booking ID' });
    }

    const result = await handleDeleteBooking(user_id, bookingId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
