import supabase from '../config/supabaseClient.js';

export const handleCreateBookingWithServices = async (user_id, service_ids, booking_start_datetime, notes = null) => {
  const client = supabase;

  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    throw new Error('At least one service must be selected.');
  }

  // Step 1: Validate and fetch services
  const { data: services, error: servicesError } = await client
      .from('service')
      .select('*')
      .in('service_id', service_ids);

  if (servicesError || services.length !== service_ids.length) {
    console.error('[SERVICES ERROR]', servicesError);
    throw new Error('Some services are invalid or not found.');
  }

  // Step 2: Get stylist_id from stylist_service
  const { data: stylistMapping, error: stylistError } = await client
      .from('stylist_service')
      .select('stylist_id')
      .in('service_id', service_ids);

  if (stylistError || !stylistMapping) {
    console.error('[STYLIST SERVICE ERROR]', stylistError);
    throw new Error('Could not fetch stylist-service mapping.');
  }

  const stylistIds = [...new Set(stylistMapping.map(s => s.stylist_id))];

  if (stylistIds.length !== 1) {
    throw new Error('All selected services must be handled by the same stylist.');
  }

  const stylist_id = stylistIds[0];

  // Step 3: Get stylist and salon info
  const { data: stylist, error: stylistFetchError } = await client
      .from('stylist')
      .select('stylist_id, salon_id')
      .eq('stylist_id', stylist_id)
      .eq('is_active', true)
      .single();

  if (stylistFetchError || !stylist) {
    console.error('[STYLIST FETCH ERROR]', stylistFetchError);
    throw new Error('Stylist not found or inactive.');
  }

  const { salon_id } = stylist;

  // Step 4: Calculate total duration & price
  const total_duration_minutes = services.reduce((acc, s) => acc + s.duration_minutes, 0);
  const total_price = services.reduce((acc, s) => acc + parseFloat(s.price), 0.0);
  const booking_start = new Date(booking_start_datetime);
  const booking_end = new Date(booking_start.getTime() + total_duration_minutes * 60000);

  // Convert to ISO for DB
  const booking_end_datetime = booking_end.toISOString();

  // Step 5: Find available workstation (date + time aware)
  const { data: workstations, error: workstationError } = await client
      .from('workstation')
      .select('workstation_id')
      .eq('salon_id', salon_id);

  if (workstationError || !workstations || workstations.length === 0) {
    console.error('[WORKSTATION FETCH ERROR]', workstationError);
    throw new Error('No workstations found for this salon.');
  }

  let available_workstation_id = null;

  for (const ws of workstations) {
    const { count, error: bookingConflictError } = await client
        .from('booking')
        .select('booking_id', { count: 'exact', head: true })
        .eq('workstation_id', ws.workstation_id)
        .or(`booking_start_datetime.lte.${booking_end.toISOString()},booking_end_datetime.gte.${booking_start.toISOString()}`);

    if (bookingConflictError) {
      console.error('[BOOKING CONFLICT ERROR]', bookingConflictError);
      throw new Error('Error checking workstation availability');
    }

    if (count === 0) {
      available_workstation_id = ws.workstation_id;
      break;
    }
  }

  if (!available_workstation_id) {
    throw new Error('No available workstations at the selected time.');
  }

  // Step 6: Create booking
  const { data: booking, error: bookingError } = await client
      .from('booking')
      .insert([{
        user_id,
        salon_id,
        stylist_id,
        booking_start_datetime,
        booking_end_datetime,
        workstation_id: available_workstation_id,
        notes,
        total_duration_minutes,
        total_price
      }])
      .select('booking_id')
      .single();

  if (bookingError || !booking) {
    console.error('[BOOKING INSERT ERROR]', bookingError?.message || bookingError);
    throw new Error('Failed to create booking.');
  }

  const booking_id = booking.booking_id;

  // Step 7: Insert into booking_services
  const servicesToInsert = services.map(service => ({
    booking_id,
    service_id: service.service_id,
    salon_id,
    service_price_at_booking: service.price,
    service_duration_at_booking: service.duration_minutes
  }));

  const { error: bsError } = await client
      .from('booking_services')
      .insert(servicesToInsert);

  if (bsError) {
    console.error('[BOOKING_SERVICES INSERT ERROR]', bsError);
    await client.from('booking').delete().eq('booking_id', booking_id);
    throw new Error('Failed to add booking services, rolled back booking.');
  }

  return {
    booking_id,
    workstation_id: available_workstation_id,
    message: 'Booking successfully created.'
  };
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