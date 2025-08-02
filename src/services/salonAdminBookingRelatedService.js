import supabase from "../config/supabaseClient.js";

export const handleCreateBooking = async (
  non_online_customer_name,
  non_online_customer_mobile_number,
  service_ids,
  booking_start_datetime,
  notes = null
) => {
  try {
    // 0. Insert non-online customer and get ID
    const { data: newCustomer, error: nonOnlineCustomerInsertErr } =
      await supabase
        .from("non_online_customers")
        .insert([
          {
            non_online_customer_name,
            non_online_customer_mobile_number,
            created_at: new Date(),
          },
        ])
        .select("non_online_customer_id") // 👈 make sure your table has this column
        .single();

    if (nonOnlineCustomerInsertErr) {
      console.error(
        "❌ Failed to create non-online customer:",
        nonOnlineCustomerInsertErr.message
      );
      throw new Error("Non-online customer creation failed.");
    }

    const non_online_customer_id = newCustomer.non_online_customer_id;

    if (!Array.isArray(service_ids) || service_ids.length === 0) {
      throw new Error("At least one service must be selected.");
    }

    // 1. Fetch services
    const { data: services, error: serviceErr } = await supabase
      .from("service")
      .select("service_id, salon_id, duration_minutes, price")
      .in("service_id", service_ids);

    if (serviceErr)
      throw new Error("Error fetching services: " + serviceErr.message);
    if (!services || services.length !== service_ids.length) {
      throw new Error("Invalid or unavailable services selected.");
    }

    const salonIds = [...new Set(services.map((s) => s.salon_id))];
    if (salonIds.length > 1)
      throw new Error("All services must belong to the same salon.");
    const salon_id = salonIds[0];

    // 2. Validate stylist
    const { data: stylistMap, error: stylistErr } = await supabase
      .from("stylist_service")
      .select("stylist_id")
      .in("service_id", service_ids)
      .eq("salon_id", salon_id);

    if (stylistErr)
      throw new Error(
        "Error fetching stylist-service mapping: " + stylistErr.message
      );

    const stylistCounter = {};
    stylistMap.forEach((s) => {
      stylistCounter[s.stylist_id] = (stylistCounter[s.stylist_id] || 0) + 1;
    });

    const stylist_id = Object.entries(stylistCounter).find(
      ([_, count]) => count === service_ids.length
    )?.[0];
    if (!stylist_id)
      throw new Error("Selected services must be handled by the same stylist.");

    // 3. Check stylist is active
    const { data: stylist, error: stylistActiveErr } = await supabase
      .from("stylist")
      .select("is_active")
      .eq("stylist_id", stylist_id)
      .single();

    if (stylistActiveErr)
      throw new Error(
        "Error checking stylist status: " + stylistActiveErr.message
      );
    if (!stylist?.is_active)
      throw new Error("The stylist is currently inactive.");

    // 4. Calculate duration & end time
    const total_duration_minutes = services.reduce(
      (acc, s) => acc + s.duration_minutes,
      0
    );
    const booking_start = new Date(booking_start_datetime);
    const booking_end = new Date(
      booking_start.getTime() + total_duration_minutes * 60000
    );

    // 5. Find free workstation
    const { data: allStations, error: stationErr } = await supabase
      .from("workstation")
      .select("workstation_id")
      .eq("salon_id", salon_id);

    if (stationErr)
      throw new Error("Error fetching workstations: " + stationErr.message);
    const allStationIds = allStations.map((ws) => ws.workstation_id);

    const { data: busyBookings, error: busyErr } = await supabase
      .from("booking")
      .select("workstation_id")
      .eq("salon_id", salon_id)
      .not("workstation_id", "is", null)
      .lt("booking_start_datetime", booking_end.toISOString())
      .gt("booking_end_datetime", booking_start.toISOString());

    if (busyErr) throw new Error("Failed checking workstation availability");
    const busyStationIds = new Set(
      (busyBookings || []).map((b) => b.workstation_id)
    );
    const freeStationId = allStationIds.find((id) => !busyStationIds.has(id));

    if (!freeStationId)
      throw new Error(
        "No available workstation found for the selected time slot."
      );

    // 6. Insert booking (🔗 include non_online_customer_id here!)
    const { data: booking, error: bookingErr } = await supabase
      .from("booking")
      .insert([
        {
          salon_id,
          stylist_id,
          workstation_id: freeStationId,
          booking_start_datetime: booking_start.toISOString(),
          total_duration_minutes,
          notes,
          non_online_customer_id, // 👈 Added this field
        },
      ])
      .select()
      .single();

    if (bookingErr)
      throw new Error("Booking creation failed: " + bookingErr.message);
    const booking_id = booking.booking_id;

    // 7. Insert booking_services
    const bookingServices = services.map((s) => ({
      booking_id,
      service_id: s.service_id,
      salon_id,
      service_price_at_booking: s.price,
      service_duration_at_booking: s.duration_minutes,
    }));

    const { error: bsError } = await supabase
      .from("booking_services")
      .insert(bookingServices);

    if (bsError) {
      await supabase.from("booking").delete().eq("booking_id", booking_id);
      throw new Error(
        "Failed to insert booking services. Booking has been rolled back."
      );
    }

    return {
      message: "Booking created successfully",
      booking_id,
      non_online_customer_id,
    };
  } catch (err) {
    console.error("❌ Booking error:", err.message);
    throw new Error(
      err.message || "Something went wrong while creating the booking."
    );
  }
};

export const handleGetAllBookings = async (user_id) => {
  console.log("Fetching all bookings for salon admin...");
  const salon_id = await getSalonIdByAdmin(user_id);
  const { data, error } = await supabase
    .from("booking")
    .select(
      `
      booking_id,
      booking_start_datetime,
      booking_end_datetime,
      stylist:stylist_id (
        stylist_id,
        stylist_name
      ),
      workstation:workstation_id (
        workstation_id,
        workstation_name
      ),
      salon:salon_id (
        salon_id,
        salon_name
      ),
      non_online_customer:non_online_customer_id (
        non_online_customer_id,
        non_online_customer_name,
        non_online_customer_mobile_number
      ),
      booking_services (
        service_id,
        service_price_at_booking,
        service_duration_at_booking
      ),
      user_id,
      notes
    `
    )
    .eq("salon_id", salon_id)
    .neq("status", "cancelled")
    .gte("booking_start_datetime", (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString(); })())
    .lt("booking_start_datetime", new Date().toISOString())
    .order("booking_start_datetime", { ascending: true });

  if (error) throw new Error(error.message);

  for (let i = 0; i < data.length; i++) {
    const booking = data[i];
    if (booking.user_id) {
      // Fetch user details if needed
      const { data: user, error: userError } = await supabase
        .from("customer")
        .select("first_name, last_name, contact_number")
        .eq("user_id", booking.user_id)
        .single();

      if (userError) {
        console.error("Failed to fetch user details:", userError.message);
        data[i].customer = null;
      } else {
        data[i].customer = user;
      }
    }
  }
  return data;
};

export const handleUpdateBooking = async (user_id, booking_id, updates) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: existingBooking, error: fetchError } = await supabase
    .from("booking")
    .select("salon_id")
    .eq("booking_id", booking_id)
    .single();

  if (fetchError || !existingBooking) throw new Error("Booking not found");
  if (existingBooking.salon_id !== salon_id)
    throw new Error("Unauthorized to edit this booking");

  const { error: updateError, data } = await supabase
    .from("booking")
    .update({ ...updates, updated_at: new Date() })
    .eq("booking_id", booking_id)
    .select();

  if (updateError) throw new Error(updateError.message);

  return { message: "Booking updated successfully", data };
};

export const handleDeleteBooking = async (user_id, booking_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: booking, error: fetchError } = await supabase
    .from("booking")
    .select("salon_id")
    .eq("booking_id", booking_id)
    .single();

  if (fetchError || !booking) throw new Error("Booking not found");
  if (booking.salon_id !== salon_id)
    throw new Error("Unauthorized to delete this booking");

  const { error: deleteError } = await supabase
    .from("booking")
    .update({ status: "cancelled", updated_at: new Date() })
    .eq("booking_id", booking_id);

  if (deleteError) throw new Error(deleteError.message);

  return { message: "Booking deleted successfully" };
};

const getSalonIdByAdmin = async (user_id) => {
  const { data, error } = await supabase
    .from("salon")
    .select("salon_id")
    .eq("admin_user_id", user_id)
    .single();

  if (error || !data) throw new Error("Salon not found for this admin");
  return data.salon_id;
};
