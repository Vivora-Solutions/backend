import supabase from "../config/supabaseClient.js";

// Get salon_id by admin user_id
const getSalonIdByAdmin = async (user_id) => {
  const { data, error } = await supabase
    .from("salon")
    .select("salon_id")
    .eq("admin_user_id", user_id)
    .single();

  if (error || !data) throw new Error("Salon not found for this admin");
  return data.salon_id;
};

// Helper function to get current Sri Lanka time and convert to UTC for database filtering
const getSriLankaTimeForFiltering = () => {
  // Get current time in Sri Lanka (UTC+5:30)
  const now = new Date();
  const sriLankaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
  
  // Create a UTC time with the same hour/minute/second as Sri Lanka time
  // This works around the database issue where Sri Lanka time is stored as UTC
  const year = sriLankaTime.getFullYear();
  const month = sriLankaTime.getMonth();
  const date = sriLankaTime.getDate();
  const hours = sriLankaTime.getHours();
  const minutes = sriLankaTime.getMinutes();
  const seconds = sriLankaTime.getSeconds();
  
  // Create UTC time with Sri Lanka time values (for database filtering)
  const filterTime = new Date(Date.UTC(year, month, date, hours, minutes, seconds));
  
  // Today's start and end in the same format
  const todayStart = new Date(Date.UTC(year, month, date, 0, 0, 0));
  const todayEnd = new Date(Date.UTC(year, month, date, 23, 59, 59));
  
  return {
    sriLankaTime,
    currentTimeFilter: filterTime.toISOString(),
    todayStart: todayStart.toISOString(),
    todayEnd: todayEnd.toISOString(),
    currentTime: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
  };
};

export const getNotificationsForSalonAdmin = async (user_id) => {
  try {
    const salon_id = await getSalonIdByAdmin(user_id);
    const { sriLankaTime, currentTimeFilter, todayStart, todayEnd, currentTime } = getSriLankaTimeForFiltering();

    // Get bookings for today starting from current Sri Lanka time onwards
    const { data: bookings, error: bookingsError } = await supabase
      .from("booking")
      .select(
        `
        booking_id,
        booking_start_datetime,
        user_id,
        stylist:stylist_id (
          stylist_id,
          stylist_name
        ),
        non_online_customer:non_online_customer_id (
          non_online_customer_id,
          non_online_customer_name,
          non_online_customer_mobile_number
        )
      `
      )
      .eq("salon_id", salon_id)
      .gte("booking_start_datetime", todayStart)
      .lte("booking_start_datetime", todayEnd)
      .gte("booking_start_datetime", currentTimeFilter)
      .not("status", "in", ["completed", "cancelled"])
      .order("booking_start_datetime", { ascending: true });

    if (bookingsError) throw new Error(bookingsError.message);

    // Get customer details for online bookings
    const onlineUserIds = bookings?.filter(booking => booking.user_id).map(booking => booking.user_id) || [];
    let customerData = {};
    
    if (onlineUserIds.length > 0) {
      const { data: customers, error: customerError } = await supabase
        .from("customer")
        .select("user_id, first_name, last_name, contact_number")
        .in("user_id", onlineUserIds);
        
      if (!customerError && customers) {
        customers.forEach(customer => {
          customerData[customer.user_id] = customer;
        });
      }
    }

    // Process bookings to return only required data
    const processedBookings = (bookings || []).map((booking) => {
      const startTime = new Date(booking.booking_start_datetime);
      const minutesRemaining = Math.round((startTime - sriLankaTime) / (1000 * 60));
      
      // Determine customer details based on booking type
      let customerName = "Unknown Customer";
      let customerPhone = null;
      
      if (booking.user_id && customerData[booking.user_id]) {
        // Online customer
        const customer = customerData[booking.user_id];
        customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || "Online Customer";
        customerPhone = customer.contact_number || null;
      } else if (booking.non_online_customer) {
        // Walk-in customer
        customerName = booking.non_online_customer.non_online_customer_name || "Walk-in Customer";
        customerPhone = booking.non_online_customer.non_online_customer_mobile_number || null;
      }
      
      return {
        booking_id: booking.booking_id,
        booking_start_time: booking.booking_start_datetime,
        stylist_id: booking.stylist?.stylist_id || null,
        stylist_name: booking.stylist?.stylist_name || "Unassigned",
        customer_name: customerName,
        customer_phone: customerPhone,
        time_remaining_minutes: minutesRemaining > 0 ? minutesRemaining : 0
      };
    });

    return {
      message: "Notifications fetched successfully",
      data: {
        bookings: processedBookings,
        total_count: processedBookings.length,
        current_sri_lanka_time: currentTime,
        generated_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(`Notification service error: ${error.message}`);
  }
};