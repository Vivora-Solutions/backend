import supabase from '../config/supabaseClient.js';

export const handleCreateBooking = async (userId, bookingData) => {
  const {
    salon_id,
    stylist_id,
    booking_start_datetime,
    booking_end_datetime,
    total_duration_minutes,
    total_price,
    booked_mode = 'online',
    notes
  } = bookingData;
  
  // Validate booking times
  const startTime = new Date(booking_start_datetime);
  const endTime = new Date(booking_end_datetime);
  const now = new Date();
  
  if (startTime <= now) {
    throw new Error('Booking start time must be in the future');
  }
  
  if (endTime <= startTime) {
    throw new Error('Booking end time must be after start time');
  }
  
  // Check if salon exists
  const { data: salonExists, error: salonError } = await supabase
    .from('salon')
    .select('salon_id')
    .eq('salon_id', salon_id)
    .single();
    
  if (salonError) throw new Error('Salon not found');
  
  // Check if stylist exists (if provided)
  if (stylist_id) {
    const { data: stylistExists, error: stylistError } = await supabase
      .from('stylist')
      .select('stylist_id')
      .eq('stylist_id', stylist_id)
      .single();
      
    if (stylistError) throw new Error('Stylist not found');
  }
  
  // Create booking
  const { data, error } = await supabase
    .from('booking')
    .insert({
      user_id: userId,
      salon_id,
      stylist_id: stylist_id || null,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      booked_mode,
      notes: notes || null,
      status: 'pending'
    })
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address
      ),
      stylist (
        stylist_name

      )
    `)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const handleGetUserBookings = async (userId) => {
  const { data, error } = await supabase
    .from('booking')
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address,
        salon_contact_number
      ),
      stylist (
        stylist_name
      )
    `)
    .eq('user_id', userId)
    .in('status', ['pending', 'confirmed', 'in_progress'])
    .order('booking_start_datetime', { ascending: true });
    
  if (error) throw new Error(error.message);
  return data;
};

export const handleGetBookingById = async (userId, bookingId) => {
  const { data, error } = await supabase
    .from('booking')
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address,
        salon_contact_number
      ),
      stylist (
        stylist_name
      )
    `)
    .eq('booking_id', bookingId)
    .eq('user_id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
};

export const handleUpdateBooking = async (userId, bookingId, updateData) => {
  // Only allow updating notes and stylist for pending bookings
  const allowedFields = ['notes', 'stylist_id'];
  const filteredUpdateData = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = updateData[key];
    }
  });
  
  if (Object.keys(filteredUpdateData).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const { data, error } = await supabase
    .from('booking')
    .update(filteredUpdateData)
    .eq('booking_id', bookingId)
    .eq('user_id', userId)
    .eq('status', 'pending') // Only allow updating pending bookings
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address
      ),
      stylist (
        stylist_name
      )
    `)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
};

export const handleCancelBooking = async (userId, bookingId) => {
  // Check if booking can be cancelled (must be pending or confirmed, and at least 2 hours before start time)
  const { data: bookingCheck, error: checkError } = await supabase
    .from('booking')
    .select('booking_start_datetime, status')
    .eq('booking_id', bookingId)
    .eq('user_id', userId)
    .single();
    
  if (checkError) {
    if (checkError.code === 'PGRST116') return null;
    throw new Error(checkError.message);
  }
  
  const startTime = new Date(bookingCheck.booking_start_datetime);
  const now = new Date();
  const timeDifference = startTime - now;
  const hoursUntilBooking = timeDifference / (1000 * 60 * 60);
  
  if (!['pending', 'confirmed'].includes(bookingCheck.status)) {
    throw new Error('Booking cannot be cancelled');
  }
  
  if (hoursUntilBooking < 2) {
    throw new Error('Booking can only be cancelled at least 2 hours before the scheduled time');
  }
  
  const { data, error } = await supabase
    .from('booking')
    .update({ 
      status: 'cancelled'
    })
    .eq('booking_id', bookingId)
    .eq('user_id', userId)
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address
      ),
      stylist (
        stylist_name
      )
    `)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const handleRescheduleBooking = async (userId, bookingId, newStartDateTime, newEndDateTime) => {
  // Validate new booking times
  const startTime = new Date(newStartDateTime);
  const endTime = new Date(newEndDateTime);
  const now = new Date();
  
  if (startTime <= now) {
    throw new Error('New booking start time must be in the future');
  }
  
  if (endTime <= startTime) {
    throw new Error('New booking end time must be after start time');
  }
  
  // Check if booking can be rescheduled
  const { data: bookingCheck, error: checkError } = await supabase
    .from('booking')
    .select('booking_start_datetime, status')
    .eq('booking_id', bookingId)
    .eq('user_id', userId)
    .single();
    
  if (checkError) {
    if (checkError.code === 'PGRST116') return null;
    throw new Error(checkError.message);
  }
  
  if (!['pending', 'confirmed'].includes(bookingCheck.status)) {
    throw new Error('Booking cannot be rescheduled');
  }
  
  const originalStartTime = new Date(bookingCheck.booking_start_datetime);
  const timeDifference = originalStartTime - now;
  const hoursUntilBooking = timeDifference / (1000 * 60 * 60);
  
  if (hoursUntilBooking < 4) {
    throw new Error('Booking can only be rescheduled at least 4 hours before the scheduled time');
  }
  
  const { data, error } = await supabase
    .from('booking')
    .update({
      booking_start_datetime: newStartDateTime,
      booking_end_datetime: newEndDateTime,
      status: 'pending' // Reset to pending after reschedule
    })
    .eq('booking_id', bookingId)
    .eq('user_id', userId)
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address
      ),
      stylist (
        stylist_name
      )
    `)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const handleGetBookingHistory = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('booking')
    .select(`
      booking_id,
      salon_id,
      stylist_id,
      booking_start_datetime,
      booking_end_datetime,
      total_duration_minutes,
      total_price,
      status,
      booked_at,
      booked_mode,
      notes,
      salon (
        salon_name,
        address
      ),
      stylist (
        stylist_name

      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .in('status', ['completed', 'cancelled', 'no_show'])
    .order('booking_start_datetime', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) throw new Error(error.message);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};