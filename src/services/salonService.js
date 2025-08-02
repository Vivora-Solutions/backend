import supabase from "../config/supabaseClient.js";

export const fetchAllSalon = async () => {
  const { data, error } = await supabase
    .from("salon")
    .select(
      `
      salon_id,
      salon_name,
      location,
      salon_contact_number,
      salon_address,
      salon_description,
      is_approved,
      salon_logo_link,
      average_rating
    `
    )
    .eq("is_approved", true);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchSalonById = async (id) => {
  const { data, error } = await supabase
    .from("salon")
    .select(
      `
      salon_id,
      salon_name,
      location,
      salon_contact_number,
      salon_email,
      salon_address,
      salon_description,
      salon_logo_link,
      average_rating,
      banner_images (
        image_link
      )
    `
    )
    .eq("salon_id", id)
    .eq("is_approved", true)
    .single();

  if (error || !data) throw new Error("Salon not found or not approved");
  return data;
};

export const fetchSalonsByLocation = async (
  { latitude, longitude },
  radius = 5000
) => {
  if (!latitude || !longitude) {
    throw new Error("Latitude and longitude are required");
  }

  const { data, error } = await supabase.rpc("get_salons_nearby", {
    lat: latitude,
    lng: longitude,
    radius_meters: radius, // optional
  });

  if (error) {
    console.error("Error fetching salons by location:", error.message);
    throw new Error("Failed to fetch salons by location");
  }

  return data;
};

export const fetchSalonsByName = async (name) => {
  const { data, error } = await supabase
    .from("salon")
    .select("*")
    .ilike("salon_name", `%${name}%`);
  if (error) throw new Error(error.message);
  return data;
};

// Placeholder, needs a `service_type` column in your salon or a relation table
export const fetchSalonsByService = async (serviceType) => {
  const { data, error } = await supabase
    .from("service")
    .select("*")
    .ilike("salon_description", `%${serviceType}%`);
  if (error) throw new Error(error.message);
  return data;
};

// Assuming `salon_description` or a column includes 'male', 'female', etc.
export const fetchSalonsByType = async (salonId) => {
  const { data, error } = await supabase
    .from("service")
    .select("*")
    .eq("salon_id", salonId);
  if (error) throw new Error(error.message);
  return data;
};

export const fetchStylistsBySalon = async (salonId) => {
  const { data, error } = await supabase
    .from("stylist")
    .select("*")
    .eq("salon_id", salonId)
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return data;
};

export const fetchStylistAvailability = async (stylistId) => {
  const { data, error } = await supabase
    .from("stylist_work_schedule")
    .select("*")
    .eq("stylist_id", stylistId);
  if (error) throw new Error(error.message);
  return data;
};

export const fetchSalonsByServiceName = async (serviceName) => {
  if (!serviceName || typeof serviceName !== "string") {
    throw { status: 400, message: "Invalid or missing service name" };
  }

  const { data, error } = await supabase
    .from("service")
    .select(
      `
      service_id,
      service_name,
      price,
      duration_minutes,
      salon:salon_id (
        salon_id,
        salon_name,
        salon_email,
        salon_address,
        salon_logo_link,
        salon_description,
        is_approved,
        location
      )
    `
    )
    .ilike("service_name", `%${serviceName}%`)
    .eq("is_available", true);

  if (error) {
    console.error("Supabase error:", error.message);
    throw { status: 500, message: "Database query failed" };
  }

  if (!data || data.length === 0) {
    throw { status: 404, message: "No salons found for the given service" };
  }

  return data;
};

export const getAllServicesBySalonId = async (salonId) => {
  const { data, error } = await supabase
    .from("service")
    .select("*")
    .eq("salon_id", salonId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Get free time slots
const DAY_OF_WEEK = {
  0: 0, // Sunday
  1: 1, // Monday
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};

const parseTime = (timeStr, dateStr) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCHours(parseInt(hours), parseInt(minutes));
  return date;
};

const subtractTimeRanges = (baseRange, busyRanges) => {
  const free = [];
  let [start, end] = baseRange;

  busyRanges
    .filter(([bStart, bEnd]) => bStart < end && bEnd > start)
    .sort((a, b) => a[0] - b[0])
    .forEach(([bStart, bEnd]) => {
      if (bStart > start) free.push([start, new Date(bStart)]);
      start = bEnd > start ? new Date(bEnd) : start;
    });

  if (start < end) free.push([start, end]);
  return free;
};

const splitIntoSlots = (freeRanges, durationMinutes) => {
  const slots = [];
  const durationMs = durationMinutes * 60 * 1000;

  for (const [start, end] of freeRanges) {
    let curr = new Date(start);
    while (curr.getTime() + durationMs <= end.getTime()) {
      slots.push({
        start: new Date(curr),
        end: new Date(curr.getTime() + durationMs),
      });
      curr = new Date(curr.getTime() + 15 * 60 * 1000); // 15-min step
    }
  }

  return slots;
};

const isWorkstationAvailable = async (salonId, start, end) => {
  const { data: workstations, error: wsError } = await supabase
    .from("workstation")
    .select("workstation_id")
    .eq("salon_id", salonId);

  if (wsError) throw new Error(wsError.message);

  for (const ws of workstations) {
    const { data: bookings, error: bookingErr } = await supabase
      .from("booking")
      .select("booking_id")
      .eq("workstation_id", ws.workstation_id)
      .or("status.eq.confirmed,status.eq.pending")
      .lt("booking_start_datetime", end.toISOString())
      .gt("booking_end_datetime", start.toISOString());

    if (bookingErr) throw new Error(bookingErr.message);
    if (bookings.length === 0) return true; // at least one is free
  }

  return false;
};

export const getAvailableTimeSlotss = async ({
  service_ids,
  stylist_id,
  salon_id,
  date,
}) => {
  if (!Array.isArray(service_ids) || !stylist_id || !salon_id || !date) {
    throw new Error(
      "Missing required input: service_ids, stylist_id, salon_id, or date"
    );
  }
  const dayOfWeek = new Date(date).getUTCDay(); // 0 = Sunday
  console.log("service_ids:", service_ids, " stylist_id:", stylist_id, "salon_id:", salon_id, "date:", date, "dayOfWeek:", dayOfWeek);
  // 1. Get total duration from services
  const { data: services, error: serviceError } = await supabase
    .from("service")
    .select("duration_minutes")
    .in("service_id", service_ids);

  console.log("Services:", services);
  if (serviceError) throw new Error(serviceError.message);
  if (!services || services.length === 0)
    throw new Error("Invalid service_ids");

  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );
  console.log("Total duration:", totalDuration);

  //1.5 Check that the stylist have taken a leave
  ;
  const { data: leaves, error: leaveError } = await supabase
    .from("stylist_leave").select(`
date,stylist_id
  `)
    .eq("stylist_id", stylist_id).eq("date", date);

  if (leaveError) throw new Error(leaveError.message);
  if (leaves && leaves.length > 0) {
    throw new Error("Stylist is on leave on the selected date");
  }

  console.log("Leaves for stylist:", leaves);

  // 2. Get working blocks for stylist
  const { data: scheduleBlocks, error: scheduleError } = await supabase
    .from("stylist_schedule_day")
    .select(
      `
    schedule_id,
    stylist_work_schedule (
      start_time_daily,
      end_time_daily,
      stylist_id
    ),
    day_of_week,
    is_every_week,
    date
  `
    )
    .eq("day_of_week", dayOfWeek)
    .eq("stylist_work_schedule.stylist_id", stylist_id);

  if (scheduleError) throw new Error(scheduleError.message);
  if (!scheduleBlocks || scheduleBlocks.length === 0) {
    throw new Error("Stylist not available on selected day");
  }

  console.log("Schedule blocks:", scheduleBlocks);

  const updatedScheduleBlocks = scheduleBlocks
    .filter((block) => block.stylist_work_schedule)
    .map((block) => ({
      ...block,
      stylist_work_schedule: {
        ...block.stylist_work_schedule,
        start_time_daily: block.stylist_work_schedule.start_time_daily,
        end_time_daily: block.stylist_work_schedule.end_time_daily,
      },
    }));

  console.log("Updated schedule blocks:", updatedScheduleBlocks);

  const extra_schedules_for_day = [];
  const normal_Schedules_for_day = [];

  for (const block of updatedScheduleBlocks) {
    if (block.is_every_week && block.day_of_week === dayOfWeek) {
      normal_Schedules_for_day.push(block);
    } else if (block.date && new Date(block.date).toISOString().split("T")[0] === date) {
      extra_schedules_for_day.push(block);
    }
  }
  console.log("Normal schedules for day:", normal_Schedules_for_day);
  console.log("Extra schedules for day:", extra_schedules_for_day);

  const priorityBlocks = [];

  if (extra_schedules_for_day.length == 0) {
    priorityBlocks.push(...normal_Schedules_for_day);
  } else {
    priorityBlocks.push(...extra_schedules_for_day);
  }

  console.log("Priority blocks:", priorityBlocks);

  if (priorityBlocks.length === 0) {
    console.warn(
      `No working schedule found for stylist ${stylist_id} on ${date} (${dayOfWeek})`
    );
    return [];
  }
  // 3. Get existing bookings
  const { data: bookings, error: bookingError } = await supabase
    .from("booking")
    .select("booking_start_datetime, booking_end_datetime")
    .eq("stylist_id", stylist_id)
    .eq("salon_id", salon_id)
    .or("status.eq.confirmed,status.eq.pending")
    .gte("booking_start_datetime", `${date}T00:00:00Z`)
    .lt("booking_start_datetime", `${date}T23:59:59Z`);

  console.log("Existing bookings:", bookings);
  if (bookingError) throw new Error(bookingError.message);

  const busyTimes = bookings.map((b) => [
    new Date(b.booking_start_datetime),
    new Date(b.booking_end_datetime),
  ]);

  // 4. Compute free slots
  const allFreeSlots = [];

  // Dummy data setup
  // const start_ = new Date("2025-07-30T03:00:00");
  // const end_ = new Date("2025-07-30T10:00:00");

  // const bookings_ = [
  //   ["2025-07-30T05:31:00",
  //     "2025-07-30T07:01:00",
  //   ]
  // ];

  for (const block of priorityBlocks) {
    const start = parseTime(block.stylist_work_schedule.start_time_daily, date);
    const end = parseTime(block.stylist_work_schedule.end_time_daily, date);
    // const freeBlocks = subtractTimeRanges([start, end], busyTimes);
    console.log("Start:", start);
    console.log("End:", end);
    console.log("Busy times:", busyTimes);
    const freeBlocks = subtractTimeRanges([start, end], busyTimes);

    const possibleSlots = splitIntoSlots(freeBlocks, totalDuration);
    console.log("Possible slots:", possibleSlots.length);

    for (const slot of possibleSlots) {
      const available = await isWorkstationAvailable(
        salon_id,
        slot.start,
        slot.end
      );
      if (available) {
        allFreeSlots.push(slot);
      }
    }
    console.log("Available slots for block:", block.schedule_id, allFreeSlots.length);
  }

  return allFreeSlots;
};


export const getAvailableTimeSlotsSithum = async ({
  service_ids,
  stylist_id,
  salon_id,
  date,
}) => {
  if (!Array.isArray(service_ids) || !stylist_id || !salon_id || !date) {
    throw new Error(
      "Missing required input: service_ids, stylist_id, salon_id, or date"
    );
  }
  const dayOfWeek = new Date(date).getUTCDay(); // 0 = Sunday
  console.log("service_ids:", service_ids, " stylist_id:", stylist_id, "salon_id:", salon_id, "date:", date, "dayOfWeek:", dayOfWeek);
  // 1. Get total duration from services
  const { data: services, error: serviceError } = await supabase
    .from("service")
    .select("duration_minutes")
    .in("service_id", service_ids);

  console.log("Services:", services);
  if (serviceError) throw new Error(serviceError.message);
  if (!services || services.length === 0)
    throw new Error("Invalid service_ids");

  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );
  console.log("Total duration:", totalDuration);

  // 2. Get working blocks for stylist
  const { data: scheduleBlocks, error: scheduleError } = await supabase
    .from("stylist_schedule_day")
    .select(
      `
    schedule_id,
    stylist_work_schedule (
      start_time_daily,
      end_time_daily,
      stylist_id
    ),
    day_of_week,
    is_every_week,
    date
  `
    )
    .eq("day_of_week", dayOfWeek)
    .eq("is_every_week", true)
    .eq("stylist_work_schedule.stylist_id", stylist_id);

  if (scheduleError) throw new Error(scheduleError.message);
  if (!scheduleBlocks || scheduleBlocks.length === 0) {
    throw new Error("Stylist not available on selected day");
  }

  console.log("Schedule blocks:", scheduleBlocks);

  const updatedScheduleBlocks = scheduleBlocks
    .filter((block) => block.stylist_work_schedule)
    .map((block) => ({
      ...block,
      stylist_work_schedule: {
        ...block.stylist_work_schedule,
        start_time_daily: block.stylist_work_schedule.start_time_daily,
        end_time_daily: block.stylist_work_schedule.end_time_daily,
      },
    }));

  console.log("Updated schedule blocks:", updatedScheduleBlocks);

  const { data: breakBlocks, error: breakError } = await supabase
    .from("stylist_leave")
    .select(
      `
    stylist_id,
    day_of_week,
    leave_start_time,
    leave_end_time
  `
    )
    .eq("stylist_id", stylist_id)
    .eq("day_of_week", dayOfWeek);
  if (breakError) throw new Error(breakError.message);
  console.log("Break blocks:", breakBlocks);

  const busyTimes = [];

  if (breakBlocks && breakBlocks.length > 0) {
    for (const block of breakBlocks) {
      const start = parseTime(block.leave_start_time, date);
      const end = parseTime(block.leave_end_time, date);
      busyTimes.push([start, end]);
    }
  }
  // 5. Compute free slots
  const allFreeSlots = [];

  // Dummy data setup
  // const start_ = new Date("2025-07-30T03:00:00");
  // const end_ = new Date("2025-07-30T10:00:00");

  // const bookings_ = [
  //   ["2025-07-30T05:31:00",
  //     "2025-07-30T07:01:00",
  //   ]
  // ];

  for (const block of updatedScheduleBlocks) {
    const start = parseTime(block.stylist_work_schedule.start_time_daily, date);
    const end = parseTime(block.stylist_work_schedule.end_time_daily, date);
    // const freeBlocks = subtractTimeRanges([start, end], busyTimes);
    console.log("Start:", start);
    console.log("End:", end);
    console.log("Busy times:", busyTimes);
    const freeBlocks = subtractTimeRanges([start, end], busyTimes);

    const possibleSlots = splitIntoSlots(freeBlocks, totalDuration);
    console.log("Possible slots:", possibleSlots.length);

    for (const slot of possibleSlots) {
      const available = await isWorkstationAvailable(
        salon_id,
        slot.start,
        slot.end
      );
      if (available) {
        allFreeSlots.push(slot);
      }
    }
    console.log("Available slots for block:", block.schedule_id, allFreeSlots.length);
  }

  return allFreeSlots;
};
