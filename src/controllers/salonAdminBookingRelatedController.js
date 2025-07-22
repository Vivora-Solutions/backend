import {
    handleCreateBooking,
    handleUpdateBooking,
    handleDeleteBooking,
} from '../services/salonAdminBookingRelatedService.js';

export const createBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const bookingData = req.body;

    if (!user_id || !bookingData || !bookingData.booking_start_datetime || !bookingData.services?.length) {
      return res.status(400).json({ error: 'Missing required booking details or services' });
    }

    const result = await handleCreateBooking(user_id, bookingData);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
