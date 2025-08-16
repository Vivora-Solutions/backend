// import {
//     handleCreateBooking,
//     handleUpdateBooking,
//     handleDeleteBooking,
// } from '../services/salonAdminBookingRelatedService.js';
//
//
// export const createBooking = async (req, res) => {
//   try {
//
//     const { non_online_customer_name, non_online_customer_mobile_number,service_ids, booking_start_datetime, notes } = req.body;
//
//     if (!Array.isArray(service_ids) || service_ids.length === 0) {
//       return res.status(400).json({ error: 'At least one service must be selected.' });
//     }
//
//     if (!booking_start_datetime) {
//       return res.status(400).json({ error: 'Booking start datetime is required.' });
//     }
//
//     const result = await handleCreateBooking(non_online_customer_name,non_online_customer_mobile_number, service_ids, booking_start_datetime, notes);
//     res.status(201).json(result);
//   } catch (err) {
//     console.error('Booking creation error:', err);
//     res.status(500).json({ error: err.message || 'Internal Server Error' });
//   }
// };
//
//
// export const updateBooking = async (req, res) => {
//   try {
//     const user_id = req.userId;
//     const { bookingId } = req.params;
//     const updateData = req.body;
//
//     if (!user_id || !bookingId || !updateData) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
//
//     const result = await handleUpdateBooking(user_id, bookingId, updateData);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
//
// export const deleteBooking = async (req, res) => {
//   try {
//     const user_id = req.userId;
//     const { bookingId } = req.params;
//
//     if (!user_id || !bookingId) {
//       return res.status(400).json({ error: 'Missing user or booking ID' });
//     }
//
//     const result = await handleDeleteBooking(user_id, bookingId);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


import {
  handleCreateBooking,
  handleUpdateBooking,
  handleDeleteBooking,
  handleGetAllBookings,
  handleGetBookingsOfStylist,
  handleCancelBookingNonOnline,
  handleCompleteBooking,
} from "../services/salonAdminBookingRelatedService.js";

export const createBooking = async (req, res) => {
  try {
    const {
      non_online_customer_name,
      non_online_customer_mobile_number,
      service_ids,
      booking_start_datetime,
      notes,
      stylist_id,
      booked_mode,
    } = req.body;

    if (!Array.isArray(service_ids) || service_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one service must be selected." });
    }
    console.log(service_ids);

    if (!booking_start_datetime) {
      return res
        .status(400)
        .json({ error: "Booking start datetime is required." });
    }

    const result = await handleCreateBooking(
      non_online_customer_name,
      non_online_customer_mobile_number,
      service_ids,
      booking_start_datetime,
      notes,
      stylist_id,
      booked_mode
    );
    res.status(201).json(result);
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const getAllBookings = async (req, res) => {
  //console.log("Fetching all bookings...");
  try {
    //console.log("Fetching all bookings for user ID:", req.userId);
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: "User ID not found" });

    const result = await handleGetAllBookings(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookingsOfStylist = async (req, res) => {
  try {
    const user_id = req.userId;
    const stylist_id = req.params.stylistId;
    if (!stylist_id) {
      return res.status(400).json({ error: "Stylist ID is required" });
    }

    const result = await handleGetBookingsOfStylist(user_id, stylist_id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching bookings for stylist:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;
    const updateData = req.body;

    if (!user_id || !bookingId || !updateData) {
      return res.status(400).json({ error: "Missing required fields" });
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
      return res.status(400).json({ error: "Missing user or booking ID" });
    }

    const result = await handleCancelBookingNonOnline(user_id, bookingId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const completeBooking = async (req, res) => {
  try {
    const user_id = req.userId;
    const { bookingId } = req.params;

    if (!user_id || !bookingId) {
      return res.status(400).json({ error: "Missing user or booking ID" });
    }

    const result = await handleCompleteBooking(user_id, bookingId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

