import supabase from '../config/supabaseClient.js';

export const handleCreateBooking = async (user_id, service_ids, booking_start_datetime, notes = null) => {
  const client = supabase;

  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    throw new Error('At least one service must be selected.');
  }

  // Get services
  const { data: services, error: servicesError } = await client
      .from('service')
      .select('*')
      .in('service_id', service_ids);

  if (servicesError || services.length !== service_ids.length) {
    throw new Error('One or more services are invalid.');
  }

  const salon_id = services[0].salon_id;

  // Check all services are from same salon
  const allSameSalon = services.every(service => service.salon_id === salon_id);
  if (!allSameSalon) {
    throw new Error('All selected services must belong to the same salon.');
  }

  // Get stylists who can perform all these services
  const { data: stylists } = await client
      .from('stylist_service')
      .select('stylist_id')
      .in('service_id', service_ids);

  const stylistServiceMap = {};
  stylists.forEach(row => {
    stylistServiceMap[row.stylist_id] = (stylistServiceMap[row.stylist_id] || 0) + 1;
  });

  const matchingStylist = Object.entries(stylistServiceMap).find(([_, count]) => count === service_ids.length);
  if (!matchingStylist) {
    throw new Error('No stylist found who offers all selected services.');
  }

  const stylist_id = matchingStylist[0];

  // Compute total duration and price
  const total_duration_minutes = services.reduce((acc, s) => acc + s.duration_minutes, 0);
  const total_price = services.reduce((acc, s) => acc + s.price, 0);

  const start = new Date(booking_start_datetime);
  const end = new Date(start.getTime() + total_duration_minutes * 60000);

  // 1. Fetch all workstations of the salon
  const { data: workstations, error: wsError } = await client
      .from('workstation')
      .select('workstation_id')
      .eq('salon_id', salon_id);

  if (wsError || !workstations.length) throw new Error('No workstations found for salon.');

  const availableWorkstation = await findFreeWorkstation(client, salon_id, workstations, start, end);

  if (!availableWorkstation) {
    throw new Error('No free workstation available at selected time');
  }

  const workstation_id = availableWorkstation;

  // Start transaction
  const { data: booking, error: bookingError } = await client.rpc('create_booking_with_services', {
    user_id,
    salon_id,
    stylist_id,
    workstation_id,
    booking_start_datetime: start.toISOString(),
    booking_end_datetime: end.toISOString(),
    total_duration_minutes,
    total_price,
    notes,
    service_ids,
  });

  if (bookingError) {
    throw new Error(bookingError.message || 'Booking creation failed');
  }

  return { message: 'Booking created successfully', data: booking };
};


async function findFreeWorkstation(client, salon_id, workstations, start, end) {
  const startISO = start.toISOString();
  const endISO = end.toISOString();

  for (let { workstation_id } of workstations) {
    const { data: conflicts, error } = await client
        .from('booking')
        .select('booking_id')
        .eq('salon_id', salon_id)
        .eq('workstation_id', workstation_id)
        .or(`and(booking_start_datetime,lt.${endISO}),and(booking_end_datetime,gt.${startISO})`);

    if (error) throw new Error('Failed checking workstation availability');

    if (conflicts.length === 0) return workstation_id;
  }

  return null;
}



// --- DELETE BOOKING ---
export const handleDeleteBooking = async (user_id, booking_id) => {
  // Only delete if booking belongs to this user
  const { data: booking, error: findErr } = await supabase
      .from('booking')
      .select('booking_id, user_id')
      .eq('booking_id', booking_id)
      .eq('user_id', user_id)
      .single();

  if (findErr) throw new Error('Booking not found or permission denied');

  const { error: deleteErr } = await supabase
      .from('booking')
      .delete()
      .eq('booking_id', booking_id);

  if (deleteErr) throw new Error('Failed to delete booking');

  return { message: 'Booking deleted successfully' };
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
        salon_address,
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
        salon_address
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