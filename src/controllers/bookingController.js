import {
  handleCreateBooking,
  handleGetUserBookings,
  handleGetBookingById,
  //handleUpdateBooking,
  handleCancelBooking,
  //handleRescheduleBooking,
  handleGetBookingHistory,
  getStylistsForAllServices
} from '../services/bookingService.js'

export const createBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    console.log(user_id);
    const { stylist_id, service_ids, booking_start_datetime, notes } = req.body;
    console.log("Hi", booking_start_datetime);

    if (!user_id || !service_ids || !booking_start_datetime || !stylist_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleCreateBooking(user_id, stylist_id, service_ids, booking_start_datetime, notes);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const deleteBooking = async (req, res) => {
//   try {
//     const user_id = req.userId;
//     const { bookingId } = req.params;
//
//     if (!bookingId) {
//       return res.status(400).json({ error: 'Booking ID is required' });
//     }
//
//     const result = await handleDeleteBooking(user_id, bookingId);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };






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



export const cancelBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;

    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!bookingId) return res.status(400).json({ error: 'Booking ID is required' });

    const result = await handleCancelBooking(user_id, bookingId);

    if (!result) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully', data: result });
  } catch (err) {
    // Business rule messages
    if (
      err.message.includes('Booking cannot be cancelled') ||
      err.message.includes('at least 1 hours before')
    ) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!bookingId) return res.status(400).json({ error: 'Booking ID is required' });

    const result = await handleCompleteBooking(user_id, bookingId);

    if (!result) {
      return res.status(404).json({ error: 'Booking not found or cannot be completed' });
    }

    res.status(200).json({ message: 'Booking completed successfully', data: result });
  } catch (err) {
    // Business rule messages
    if (
      err.message.includes('Booking cannot be completed') ||
      err.message.includes('at least 1 hours before')
    ) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error: ' + err.message });
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




