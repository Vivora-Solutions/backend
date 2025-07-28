import supabase from '../config/supabaseClient.js';

export const handleCreateBooking = async (
    user_id,
    service_ids,
    booking_start_datetime,
    notes = null
) => {
  const client = supabase;

  console.log("📥 Booking request received", {
    user_id,
    service_ids,
    booking_start_datetime,
    notes,
  });

  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    console.error("❌ No service IDs provided");
    throw new Error("At least one service must be selected.");
  }

  try {
    // 1. Fetch services and validate
    const { data: services, error: serviceErr } = await client
        .from("service")
        .select("service_id, salon_id, duration_minutes, price")
        .in("service_id", service_ids);

    if (serviceErr) throw new Error("Error fetching services: " + serviceErr.message);
    if (!services || services.length !== service_ids.length) {
      console.error("❌ Some services not found or mismatched");
      throw new Error("Invalid or unavailable services selected.");
    }

    const salonIds = [...new Set(services.map((s) => s.salon_id))];
    if (salonIds.length > 1) {
      console.error("❌ Services belong to multiple salons:", salonIds);
      throw new Error("All services must belong to the same salon.");
    }

    const salon_id = salonIds[0];

    // 2. Find a common stylist for all selected services
    const { data: stylistMap, error: stylistErr } = await client
        .from("stylist_service")
        .select("stylist_id")
        .in("service_id", service_ids)
        .eq("salon_id", salon_id);

    if (stylistErr) throw new Error("Error fetching stylist-service mapping: " + stylistErr.message);

    const stylistCounter = {};
    stylistMap.forEach((s) => {
      stylistCounter[s.stylist_id] = (stylistCounter[s.stylist_id] || 0) + 1;
    });

    const stylist_id = Object.entries(stylistCounter).find(([_, count]) => count === service_ids.length)?.[0];

    if (!stylist_id) {
      console.error("❌ No stylist assigned to all selected services");
      throw new Error("Selected services must be handled by the same stylist.");
    }

    // 3. Check stylist is active
    const { data: stylist, error: stylistActiveErr } = await client
        .from("stylist")
        .select("is_active")
        .eq("stylist_id", stylist_id)
        .single();

    if (stylistActiveErr) throw new Error("Error checking stylist status: " + stylistActiveErr.message);
    if (!stylist.is_active) {
      console.error("❌ Stylist is not active:", stylist_id);
      throw new Error("The stylist assigned to the services is currently inactive.");
    }

    // 4. Calculate total duration & end time
    const total_duration_minutes = services.reduce((acc, s) => acc + s.duration_minutes, 0);
    const booking_start = new Date(booking_start_datetime);
    const booking_end = new Date(booking_start.getTime() + total_duration_minutes * 60000);


    console.log('🔍 Booking Start:', booking_start_datetime);
    console.log('🕒 Booking End:', booking_end);
    console.log('🧮 Total Duration:', total_duration_minutes);
    console.log('🏢 Salon ID:', salon_id);

    // 5. Get all workstations in salon
    const { data: allStations, error: stationErr } = await client
        .from("workstation")
        .select("workstation_id")
        .eq("salon_id", salon_id);

    if (stationErr) throw new Error("Error fetching workstations: " + stationErr.message);
    if (!allStations || allStations.length === 0) {
      console.error("❌ No workstations found for salon:", salon_id);
      throw new Error("No workstations available in this salon.");
    }

    const allStationIds = allStations.map((ws) => ws.workstation_id);

    // 6. Check for overlapping bookings
    const { data: busyBookings, error: busyErr } = await client
        .from("booking")
        .select("workstation_id")
        .eq("salon_id", salon_id)
        .not("workstation_id", "is", null)
        .lt("booking_start_datetime", booking_end.toISOString())
        .gt("booking_end_datetime", booking_start.toISOString());

    if (busyErr) {
      console.error("❌ Error checking busy bookings", busyErr);
      throw new Error("Failed checking workstation availability");
    }

    const busyStationIds = new Set((busyBookings || []).map((b) => b.workstation_id));
    const freeStationId = allStationIds.find((id) => !busyStationIds.has(id));

    console.log("🔍 Workstation Availability Check", {
      allStationIds,
      busyStationIds: Array.from(busyStationIds),
      freeStationId,
    });

    if (!freeStationId) {
      throw new Error("No available workstation found for the selected time slot.");
    }

    // 7. Insert booking
    const { data: booking, error: bookingErr } = await client
        .from("booking")
        .insert([
          {
            user_id,
            salon_id,
            stylist_id,
            workstation_id: freeStationId,
            booking_start_datetime: booking_start.toISOString(),
            total_duration_minutes,
            notes,
          },
        ])
        .select()
        .single();

    if (bookingErr) {
      console.error("❌ Booking insert failed:", bookingErr.message);
      throw new Error("Booking creation failed.");
    }

    const booking_id = booking.booking_id;

    // 8. Insert booking services
    const bookingServices = services.map((s) => ({
      booking_id,
      service_id: s.service_id,
      salon_id: salon_id,
      service_price_at_booking: s.price,
      service_duration_at_booking: s.duration_minutes,
    }));

    const { error: bsError } = await client.from("booking_services").insert(bookingServices);



    if (bsError) {
      console.error("❌ Booking services insert failed:", bsError.message);
      // rollback
      await client.from("booking").delete().eq("booking_id", booking_id);
      throw new Error("Failed to insert booking services. Booking has been rolled back.");
    }

    console.log("✅ Booking created successfully:", {
      booking_id,
      user_id,
      services: service_ids,
      booking_start,
      booking_end,
    });

    return {
      message: "Booking created successfully",
      booking_id,
    };

  } catch (err) {
    console.error("❌ Booking creation error:", err.message);
    throw new Error(err.message || "Something went wrong while creating the booking.");
  }
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