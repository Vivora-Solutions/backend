import supabase from "../config/supabaseClient.js";


export const fetchAllSalon = async () => {
  const { data, error } = await supabase
    .from("salon")
    .select(`
      salon_id,
      salon_name,
      location,
      salon_contact_number,
      salon_address,
      salon_description,
      is_approved,
      salon_logo_link,
      average_rating,
      banner_images (
        image_link
      ),
      salon_opening_hours(
        day_of_week,
        is_open,
        opening_time,
        closing_time
      )
    `)
    .eq("is_approved", true);

  if (error) throw new Error(error.message);

  // Now, manually filter to only the first image per salon
  const salonsWithOneBanner = data.map((salon) => {
    return {
      ...salon,
      banner_image: salon.banner_images?.[0]?.image_link ?? null,
    };
  });

  return salonsWithOneBanner;
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

export const fetchServiceById = async (serviceId) => {
  if (!serviceId || typeof serviceId !== "string") {
    throw { status: 400, message: "Invalid or missing service ID" };
  }

  const { data, error } = await supabase
    .from("service")
    .select(
      `
      service_name,
      price,
      duration_minutes,
      salon:salon_id (
        salon_name,
        salon_logo_link,
        salon_description,
        location
      )
    `
    )
    .eq("service_id", serviceId)
    .single(); // since service_id is unique

  if (error) {
    console.error("Supabase error:", error.message);
    throw { status: 500, message: "Database query failed" };
  }

  if (!data) {
    throw { status: 404, message: "Service not found" };
  }

  return data;
};





export const getAllServicesBySalonId = async (salonId) => {
  const { data, error } = await supabase
    .from("service")
    .select("*")
    .eq("salon_id", salonId)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};


const parseTime = (timeStr, dateStr) => {
  if (timeStr.includes("T")) {
    return new Date(timeStr); // ISO timestamp
  }

  // Assume time-only, e.g. "11:00:00"
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

const splitIntoSlotsSithum = (freeRanges, durationMinutes) => {
  const slots = [];
  const durationMs = durationMinutes * 60 * 1000;
  const stepMs = 15 * 60 * 1000; // 15-min step

  for (const [start, end] of freeRanges) {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const availableDuration = endTime - startTime;

    // Skip this range if it's too small for the service
    if (availableDuration < durationMs) continue;

    // Pre-calculate how many slots we can fit
    const numSlots = Math.floor((availableDuration - durationMs) / stepMs) + 1;

    // Pre-allocate slots in one go
    for (let i = 0; i < numSlots; i++) {
      const slotStart = new Date(startTime + (i * stepMs));
      const slotEnd = new Date(slotStart.getTime() + durationMs);
      slots.push({ start: slotStart, end: slotEnd });
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




export const getAvailableTimeSlotsSithum = async ({
  service_ids,
  stylist_id,
  salon_id,
  date,
}) => {
  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    throw new Error("Missing or invalid required input: service_ids (must be a non-empty array)");
  }
  if (!stylist_id) {
    throw new Error("Missing required input: stylist_id");
  }
  if (!salon_id) {
    throw new Error("Missing required input: salon_id");
  }
  if (!date) {
    throw new Error("Missing required input: date");
  }

  const dayOfWeek = new Date(date).getUTCDay(); // 0 = Sunday
  console.log("Input:", { service_ids, stylist_id, salon_id, date, dayOfWeek });

  // 1. Get total duration
  const { data: services, error: serviceError } = await supabase
    .from("service")
    .select("duration_minutes")
    .in("service_id", service_ids);

  if (serviceError) throw new Error(serviceError.message);
  if (!services || services.length === 0)
    throw new Error("Invalid service_ids");

  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );
  console.log("Total duration:", totalDuration);

  // 1.5. check leaves (detect both all-day and partial-day leaves)
  const { data: leaves, error: leaveError } = await supabase
    .from("stylist_leave_new")
    .select("leave_start_time, leave_end_time")
    .eq("stylist_id", stylist_id);

  if (leaveError) throw new Error(leaveError.message);

  // Only check for full-day leaves (those covering the entire day)
  const dateCheckStart = new Date(`${date}T00:00:00Z`);
  const dateCheckEnd = new Date(`${date}T23:59:59Z`);
  const hasFullDayLeave = (leaves || []).some((leave) => {
    const leaveStart = new Date(leave.leave_start_time);
    const leaveEnd = new Date(leave.leave_end_time);
    // Check if leave covers the entire day (or most of it)
    return leaveStart <= dateCheckStart && leaveEnd >= dateCheckEnd;
  });

  console.log("Full day leave detected:", hasFullDayLeave);
  if (hasFullDayLeave) {
    throw new Error("Stylist is on leave for the entire day on the selected date");
  }

  // Partial day leaves will be handled later in the busy times calculation

  // 2. Get working schedule directly from new table
  const { data: scheduleBlocks, error: scheduleError } = await supabase
    .from("stylist_work_schedule_new")
    .select("schedule_id, start_time_daily, end_time_daily")
    .eq("day_of_week", dayOfWeek)
    .eq("stylist_id", stylist_id);

  if (scheduleError) throw new Error(scheduleError.message);
  console.log("Schedule blocks:", scheduleBlocks?.length || 0);
  console.log(scheduleBlocks);

  // 3. Get leave blocks (only for the specific date)
  const { data: breakBlocks, error: breakError } = await supabase
    .from("stylist_leave_new")
    .select("leave_start_time, leave_end_time")
    .eq("stylist_id", stylist_id)
    .eq("date", date); // Only fetch leaves for the selected date

  if (breakError) throw new Error(breakError.message);
  console.log("Break blocks:", breakBlocks?.length || 0);

  // 3.5 Get booked blocks (only for the specific date)
  const { data: bookedBlocks, error: bookedError } = await supabase
    .from("booking")
    .select("booking_start_datetime, booking_end_datetime")
    .eq("stylist_id", stylist_id)
    .eq("salon_id", salon_id);

  if (bookedError) throw new Error(bookedError.message);
  console.log("Booked blocks:", bookedBlocks?.length || 0);

  //3.7 filter the books for the date
  const dateStart = new Date(`${date}T00:00:00Z`);
  const dateEnd = new Date(`${date}T23:59:59Z`);
  const filteredBookedBlocks = (bookedBlocks || []).filter((block) => {
    const start = parseTime(block.booking_start_datetime, date);
    const end = parseTime(block.booking_end_datetime, date);
    // Check if booking overlaps with the selected date
    return start < dateEnd && end > dateStart;
  });

  //console.log("Filtered booked blocks:", filteredBookedBlocks.length);

  // 3.8 combine booked and blocked
  const combinedBlocks = [...filteredBookedBlocks, ...(breakBlocks || [])];

  // 4. Convert leave times to busy times
  const busyTimes = (combinedBlocks || []).map((block) => [
    parseTime(
      block.booking_start_datetime || block.leave_start_time,
      date
    ),
    parseTime(
      block.booking_end_datetime || block.leave_end_time,
      date
    ),
  ]);

  // console.log(
  //   "Busy times:",
  //   busyTimes.map(([s, e]) => ({
  //     start: s.toISOString(),
  //     end: e.toISOString(),
  //   }))
  //);

  // 5. Find available time slots - OPTIMIZED VERSION
  const allFreeSlots = [];

  for (const block of scheduleBlocks || []) {
    const start = parseTime(block.start_time_daily, date);
    const end = parseTime(block.end_time_daily, date);

    const freeBlocks = subtractTimeRanges([start, end], busyTimes);

    // Pre-filter blocks that are too short
    const validFreeBlocks = freeBlocks.filter(
      ([blockStart, blockEnd]) =>
        (blockEnd.getTime() - blockStart.getTime()) >= totalDuration * 60 * 1000
    );

    // Generate all possible slots first
    const allPossibleSlots = [];
    for (const [blockStart, blockEnd] of validFreeBlocks) {
      const startTime = blockStart.getTime();
      const endTime = blockEnd.getTime();
      const durationMs = totalDuration * 60 * 1000;
      const stepMs = 15 * 60 * 1000;

      // Calculate how many slots fit in this block
      const numSlots = Math.floor((endTime - startTime - durationMs) / stepMs) + 1;

      for (let i = 0; i < numSlots; i++) {
        const slotStart = new Date(startTime + (i * stepMs));
        const slotEnd = new Date(slotStart.getTime() + durationMs);
        allPossibleSlots.push({ start: slotStart, end: slotEnd });
      }
    }

    // Batch check workstation availability
    const availabilityChecks = allPossibleSlots.map(slot =>
      isWorkstationAvailable(salon_id, slot.start, slot.end)
    );

    // Wait for all checks to complete
    const availabilityResults = await Promise.all(availabilityChecks);

    // Filter available slots
    const availableSlots = allPossibleSlots.filter(
      (_, index) => availabilityResults[index]
    );

    allFreeSlots.push(...availableSlots);
  }
  console.log("Available slots:", allFreeSlots.length);
  console.log(allFreeSlots);

  return allFreeSlots;
};


// export const getAvailableTimeSlotss = async ({
//                                                service_ids,
//                                                stylist_id,
//                                                salon_id,
//                                                date,
//                                              }) => {
//   if (!Array.isArray(service_ids) || !stylist_id || !salon_id || !date) {
//     throw new Error(
//         "Missing required input: service_ids, stylist_id, salon_id, or date"
//     );
//   }
//   const dayOfWeek = new Date(date).getUTCDay(); // 0 = Sunday
//   console.log("service_ids:", service_ids, " stylist_id:", stylist_id, "salon_id:", salon_id, "date:", date, "dayOfWeek:", dayOfWeek);
//   // 1. Get total duration from services
//   const { data: services, error: serviceError } = await supabase
//       .from("service")
//       .select("duration_minutes")
//       .in("service_id", service_ids);
//
//   console.log("Services:", services);
//   if (serviceError) throw new Error(serviceError.message);
//   if (!services || services.length === 0)
//     throw new Error("Invalid service_ids");
//
//   const totalDuration = services.reduce(
//       (sum, s) => sum + s.duration_minutes,
//       0
//   );
//   console.log("Total duration:", totalDuration);
//
//   //1.5 Check that the stylist have taken a leave
//   ;
//   const { data: leaves, error: leaveError } = await supabase
//       .from("stylist_leave").select(`
// date,stylist_id
//   `)
//       .eq("stylist_id", stylist_id).eq("date", date);
//
//   if (leaveError) throw new Error(leaveError.message);
//   if (leaves && leaves.length > 0) {
//     throw new Error("Stylist is on leave on the selected date");
//   }
//
//   console.log("Leaves for stylist:", leaves);
//
//   // 2. Get working blocks for stylist
//   const { data: scheduleBlocks, error: scheduleError } = await supabase
//       .from("stylist_schedule_day")
//       .select(
//           `
//     schedule_id,
//     stylist_work_schedule (
//       start_time_daily,
//       end_time_daily,
//       stylist_id
//     ),
//     day_of_week,
//     is_every_week,
//     date
//   `
//       )
//       .eq("day_of_week", dayOfWeek)
//       .eq("stylist_work_schedule.stylist_id", stylist_id);
//
//   if (scheduleError) throw new Error(scheduleError.message);
//   if (!scheduleBlocks || scheduleBlocks.length === 0) {
//     throw new Error("Stylist not available on selected day");
//   }
//
//   console.log("Schedule blocks:", scheduleBlocks);
//
//   const updatedScheduleBlocks = scheduleBlocks
//       .filter((block) => block.stylist_work_schedule)
//       .map((block) => ({
//         ...block,
//         stylist_work_schedule: {
//           ...block.stylist_work_schedule,
//           start_time_daily: block.stylist_work_schedule.start_time_daily,
//           end_time_daily: block.stylist_work_schedule.end_time_daily,
//         },
//       }));
//
//   console.log("Updated schedule blocks:", updatedScheduleBlocks);
//
//   const extra_schedules_for_day = [];
//   const normal_Schedules_for_day = [];
//
//   for (const block of updatedScheduleBlocks) {
//     if (block.is_every_week && block.day_of_week === dayOfWeek) {
//       normal_Schedules_for_day.push(block);
//     } else if (block.date && new Date(block.date).toISOString().split("T")[0] === date) {
//       extra_schedules_for_day.push(block);
//     }
//   }
//   console.log("Normal schedules for day:", normal_Schedules_for_day);
//   console.log("Extra schedules for day:", extra_schedules_for_day);
//
//   const priorityBlocks = [];
//
//   if (extra_schedules_for_day.length == 0) {
//     priorityBlocks.push(...normal_Schedules_for_day);
//   } else {
//     priorityBlocks.push(...extra_schedules_for_day);
//   }
//
//   console.log("Priority blocks:", priorityBlocks);
//
//   if (priorityBlocks.length === 0) {
//     console.warn(
//         `No working schedule found for stylist ${stylist_id} on ${date} (${dayOfWeek})`
//     );
//     return [];
//   }
//   // 3. Get existing bookings
//   const { data: bookings, error: bookingError } = await supabase
//       .from("booking")
//       .select("booking_start_datetime, booking_end_datetime")
//       .eq("stylist_id", stylist_id)
//       .eq("salon_id", salon_id)
//       .or("status.eq.confirmed,status.eq.pending")
//       .gte("booking_start_datetime", `${date}T00:00:00Z`)
//       .lt("booking_start_datetime", `${date}T23:59:59Z`);
//
//   console.log("Existing bookings:", bookings);
//   if (bookingError) throw new Error(bookingError.message);
//
//   const busyTimes = bookings.map((b) => [
//     new Date(b.booking_start_datetime),
//     new Date(b.booking_end_datetime),
//   ]);
//
//   // 4. Compute free slots
//   const allFreeSlots = [];
//
//   // Dummy data setup
//   // const start_ = new Date("2025-07-30T03:00:00");
//   // const end_ = new Date("2025-07-30T10:00:00");
//
//   // const bookings_ = [
//   //   ["2025-07-30T05:31:00",
//   //     "2025-07-30T07:01:00",
//   //   ]
//   // ];
//
//   for (const block of priorityBlocks) {
//     const start = parseTime(block.stylist_work_schedule.start_time_daily, date);
//     const end = parseTime(block.stylist_work_schedule.end_time_daily, date);
//     // const freeBlocks = subtractTimeRanges([start, end], busyTimes);
//     console.log("Start:", start);
//     console.log("End:", end);
//     console.log("Busy times:", busyTimes);
//     const freeBlocks = subtractTimeRanges([start, end], busyTimes);
//
//     const possibleSlots = splitIntoSlots(freeBlocks, totalDuration);
//     console.log("Possible slots:", possibleSlots.length);
//
//     for (const slot of possibleSlots) {
//       const available = await isWorkstationAvailable(
//           salon_id,
//           slot.start,
//           slot.end
//       );
//       if (available) {
//         allFreeSlots.push(slot);
//       }
//     }
//     console.log("Available slots for block:", block.schedule_id, allFreeSlots.length);
//   }
//
//   return allFreeSlots;
// };


// export const getAvailableTimeSlotsSithum = async ({
//                                                     service_ids,
//                                                     stylist_id,
//                                                     salon_id,
//                                                     date,
//                                                   }) => {
//   if (!Array.isArray(service_ids) || !stylist_id || !salon_id || !date) {
//     throw new Error(
//         "Missing required input: service_ids, stylist_id, salon_id, or date"
//     );
//   }
//
//   const dayOfWeek = new Date(date).getUTCDay(); // 0 = Sunday
//   console.log("Input:", { service_ids, stylist_id, salon_id, date, dayOfWeek });
//
//   // 1. Get total duration
//   const { data: services, error: serviceError } = await supabase
//       .from("service")
//       .select("duration_minutes")
//       .in("service_id", service_ids);
//
//   if (serviceError) throw new Error(serviceError.message);
//   if (!services || services.length === 0)
//     throw new Error("Invalid service_ids");
//
//   const totalDuration = services.reduce(
//       (sum, s) => sum + s.duration_minutes,
//       0
//   );
//   console.log("Total duration:", totalDuration);
//
//   // 2. Get working schedule directly from new table
//   const { data: scheduleBlocks, error: scheduleError } = await supabase
//       .from("stylist_work_schedule_new")
//       .select("schedule_id, start_time_daily, end_time_daily")
//       .eq("day_of_week", dayOfWeek)
//       .eq("stylist_id", stylist_id);
//
//   if (scheduleError) throw new Error(scheduleError.message);
//   if (!scheduleBlocks || scheduleBlocks.length === 0) {
//     throw new Error("Stylist not available on selected day");
//   }
//
//   console.log("Schedule blocks:", scheduleBlocks);
//
//   // 3. Get leave blocks (only for the specific date)
//   const { data: breakBlocks, error: breakError } = await supabase
//       .from("stylist_leave_new")
//       .select("leave_start_time, leave_end_time")
//       .eq("stylist_id", stylist_id)
//       .eq("date", date); // match specific date
//
//   if (breakError) throw new Error(breakError.message);
//   console.log("Break blocks:", breakBlocks);
//
//   // 4. Convert leave times to busy times
//   const busyTimes = (breakBlocks || []).map((block) => [
//     parseTime(block.leave_start_time, date),
//     parseTime(block.leave_end_time, date),
//   ]);
//
//   console.log(
//       "Busy times:",
//       busyTimes.map(([s, e]) => ({
//         start: s.toISOString(),
//         end: e.toISOString(),
//       }))
//   );
//
//
//   // 5. Find available time slots
//   const allFreeSlots = [];
//
//   for (const block of scheduleBlocks) {
//     const start = parseTime(block.start_time_daily, date);
//     const end = parseTime(block.end_time_daily, date);
//     console.log("Start:", start, "End:", end);
//
//     const freeBlocks = subtractTimeRanges([start, end], busyTimes);
//     const possibleSlots = splitIntoSlots(freeBlocks, totalDuration);
//
//     for (const slot of possibleSlots) {
//       const available = await isWorkstationAvailable(
//           salon_id,
//           slot.start,
//           slot.end
//       );
//       if (available) {
//         allFreeSlots.push(slot);
//       }
//     }
//
//     console.log(
//         "Available slots for schedule_id:",
//         block.schedule_id,
//         allFreeSlots.length
//     );
//   }
//
//   return allFreeSlots;
// };