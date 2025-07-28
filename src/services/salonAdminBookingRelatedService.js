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


export const handleUpdateBooking = async (user_id, booking_id, updates) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: existingBooking, error: fetchError } = await supabase
    .from('booking')
    .select('salon_id')
    .eq('booking_id', booking_id)
    .single();

  if (fetchError || !existingBooking) throw new Error('Booking not found');
  if (existingBooking.salon_id !== salon_id) throw new Error('Unauthorized to edit this booking');

  const { error: updateError, data } = await supabase
    .from('booking')
    .update({ ...updates, updated_at: new Date() })
    .eq('booking_id', booking_id)
    .select();

  if (updateError) throw new Error(updateError.message);

  return { message: 'Booking updated successfully', data };
};


export const handleDeleteBooking = async (user_id, booking_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: booking, error: fetchError } = await supabase
    .from('booking')
    .select('salon_id')
    .eq('booking_id', booking_id)
    .single();

  if (fetchError || !booking) throw new Error('Booking not found');
  if (booking.salon_id !== salon_id) throw new Error('Unauthorized to delete this booking');

  const { error: deleteError } = await supabase
    .from('booking')
    .delete()
    .eq('booking_id', booking_id);

  if (deleteError) throw new Error(deleteError.message);

  return { message: 'Booking deleted successfully' };
};


const getSalonIdByAdmin = async (user_id) => {
  const { data, error } = await supabase
    .from('salon')
    .select('salon_id')
    .eq('admin_user_id', user_id)
    .single();

  if (error || !data) throw new Error('Salon not found for this admin');
  return data.salon_id;
};

