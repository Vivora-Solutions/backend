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
    `
    )
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
      const slotStart = new Date(startTime + i * stepMs);
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

// New function to check workstation capability for services
const isWorkstationCapableOfServices = async (salonId, serviceIds) => {
  const { data: workstationServices, error } = await supabase
    .from("workstation_service")
    .select(
      `
      workstation_id,
      service_id,
      workstation!inner(workstation_id, workstation_name)
    `
    )
    .eq("salon_id", salonId)
    .in("service_id", serviceIds);

  if (error) throw new Error(error.message);

  // Group services by workstation
  const workstationCapabilities = {};

  workstationServices.forEach((ws) => {
    if (!workstationCapabilities[ws.workstation_id]) {
      workstationCapabilities[ws.workstation_id] = {
        workstation_id: ws.workstation_id,
        workstation_name: ws.workstation.workstation_name,
        capable_services: [],
      };
    }
    workstationCapabilities[ws.workstation_id].capable_services.push(
      ws.service_id
    );
  });

  // Find workstations that can handle all services
  const capableWorkstations = Object.values(workstationCapabilities).filter(
    (ws) => {
      return serviceIds.every((serviceId) =>
        ws.capable_services.includes(serviceId)
      );
    }
  );

  return {
    allCapableWorkstations: Object.values(workstationCapabilities),
    fullyCapableWorkstations: capableWorkstations,
  };
};

// Updated function to check workstation availability with service capability
const isCapableWorkstationAvailable = async (
  salonId,
  serviceIds,
  start,
  end
) => {
  try {
    // Get workstations capable of performing all the services
    const { fullyCapableWorkstations, allCapableWorkstations } =
      await isWorkstationCapableOfServices(salonId, serviceIds);

    console.log("Checking workstation availability:", {
      serviceIds,
      fullyCapableWorkstations: fullyCapableWorkstations.length,
      allCapableWorkstations: allCapableWorkstations.length,
    });

    // Strategy 1: Try to find a single workstation that can do all services
    if (fullyCapableWorkstations.length > 0) {
      for (const ws of fullyCapableWorkstations) {
        const { data: bookings, error: bookingErr } = await supabase
          .from("booking")
          .select("booking_id")
          .eq("workstation_id", ws.workstation_id)
          .or("status.eq.confirmed,status.eq.pending")
          .lt("booking_start_datetime", end.toISOString())
          .gt("booking_end_datetime", start.toISOString());

        if (bookingErr) throw new Error(bookingErr.message);

        if (bookings.length === 0) {
          console.log(
            `✅ Single workstation available: ${ws.workstation_name} (${ws.workstation_id})`
          );
          return {
            available: true,
            strategy: "single_workstation",
            workstations: [ws],
          };
        }
      }
    }

    // Strategy 2: Try to find multiple workstations for different services
    // This is more complex - we need to check if we can distribute services across workstations
    if (serviceIds.length > 1 && allCapableWorkstations.length > 0) {
      const availableWorkstations = [];

      for (const ws of allCapableWorkstations) {
        const { data: bookings, error: bookingErr } = await supabase
          .from("booking")
          .select("booking_id")
          .eq("workstation_id", ws.workstation_id)
          .or("status.eq.confirmed,status.eq.pending")
          .lt("booking_start_datetime", end.toISOString())
          .gt("booking_end_datetime", start.toISOString());

        if (bookingErr) throw new Error(bookingErr.message);

        if (bookings.length === 0) {
          availableWorkstations.push(ws);
        }
      }

      // Check if we can cover all services with available workstations
      const coveredServices = new Set();
      const selectedWorkstations = [];

      for (const serviceId of serviceIds) {
        const capableAndAvailable = availableWorkstations.find(
          (ws) =>
            ws.capable_services.includes(serviceId) &&
            !selectedWorkstations.some(
              (selected) => selected.workstation_id === ws.workstation_id
            )
        );

        if (capableAndAvailable) {
          coveredServices.add(serviceId);
          if (
            !selectedWorkstations.some(
              (selected) =>
                selected.workstation_id === capableAndAvailable.workstation_id
            )
          ) {
            selectedWorkstations.push(capableAndAvailable);
          }
        }
      }

      if (coveredServices.size === serviceIds.length) {
        console.log(
          `✅ Multiple workstations available:`,
          selectedWorkstations.map((ws) => ws.workstation_name)
        );
        return {
          available: true,
          strategy: "multiple_workstations",
          workstations: selectedWorkstations,
        };
      }
    }

    console.log("❌ No capable workstations available for the time slot");
    return {
      available: false,
      strategy: null,
      workstations: [],
      reason:
        fullyCapableWorkstations.length === 0
          ? "No workstations capable of performing all selected services"
          : "All capable workstations are busy during the selected time",
    };
  } catch (error) {
    console.error("Error checking workstation capability:", error);
    throw error;
  }
};

// Updated main function
export const getAvailableTimeSlotsSithum = async ({
  service_ids,
  stylist_id,
  salon_id,
  date,
}) => {
  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    throw new Error(
      "Missing or invalid required input: service_ids (must be a non-empty array)"
    );
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

  // 1. Check if workstations exist that can perform these services
  const { fullyCapableWorkstations, allCapableWorkstations } =
    await isWorkstationCapableOfServices(salon_id, service_ids);

  if (
    fullyCapableWorkstations.length === 0 &&
    allCapableWorkstations.length === 0
  ) {
    throw new Error(
      "No workstations in this salon are capable of performing the selected services"
    );
  }

  console.log(
    `Found ${fullyCapableWorkstations.length} workstations that can do all services, ${allCapableWorkstations.length} total capable workstations`
  );

  // 2. Get total duration
  const { data: services, error: serviceError } = await supabase
    .from("service")
    .select("duration_minutes, service_name")
    .in("service_id", service_ids);

  if (serviceError) throw new Error(serviceError.message);
  if (!services || services.length === 0)
    throw new Error("Invalid service_ids");

  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );
  console.log(
    "Total duration:",
    totalDuration,
    "minutes for services:",
    services.map((s) => s.service_name)
  );

  // 3. Check for full-day leaves
  const { data: leaves, error: leaveError } = await supabase
    .from("stylist_leave_new")
    .select("leave_start_time, leave_end_time")
    .eq("stylist_id", stylist_id);

  if (leaveError) throw new Error(leaveError.message);

  const dateCheckStart = new Date(`${date}T00:00:00Z`);
  const dateCheckEnd = new Date(`${date}T23:59:59Z`);
  const hasFullDayLeave = (leaves || []).some((leave) => {
    const leaveStart = new Date(leave.leave_start_time);
    const leaveEnd = new Date(leave.leave_end_time);
    return leaveStart <= dateCheckStart && leaveEnd >= dateCheckEnd;
  });

  console.log("Full day leave detected:", hasFullDayLeave);
  if (hasFullDayLeave) {
    throw new Error(
      "Stylist is on leave for the entire day on the selected date"
    );
  }

  // 4. Get working schedule
  const { data: scheduleBlocks, error: scheduleError } = await supabase
    .from("stylist_work_schedule_new")
    .select("schedule_id, start_time_daily, end_time_daily")
    .eq("day_of_week", dayOfWeek)
    .eq("stylist_id", stylist_id);

  if (scheduleError) throw new Error(scheduleError.message);
  console.log("Schedule blocks:", scheduleBlocks?.length || 0);

  if (!scheduleBlocks || scheduleBlocks.length === 0) {
    throw new Error("Stylist is not scheduled to work on the selected day");
  }

  // 5. Get leave blocks for the specific date
  const { data: breakBlocks, error: breakError } = await supabase
    .from("stylist_leave_new")
    .select("leave_start_time, leave_end_time")
    .eq("stylist_id", stylist_id)
    .eq("date", date);

  if (breakError) throw new Error(breakError.message);
  console.log("Break blocks:", breakBlocks?.length || 0);

  // 6. Get booked blocks for the specific date
  const { data: bookedBlocks, error: bookedError } = await supabase
    .from("booking")
    .select("booking_start_datetime, booking_end_datetime")
    .eq("stylist_id", stylist_id)
    .eq("salon_id", salon_id)
    .or("status.eq.confirmed,status.eq.pending");

  if (bookedError) throw new Error(bookedError.message);
  console.log("Total booked blocks:", bookedBlocks?.length || 0);

  // Filter bookings for the specific date
  const dateStart = new Date(`${date}T00:00:00Z`);
  const dateEnd = new Date(`${date}T23:59:59Z`);
  const filteredBookedBlocks = (bookedBlocks || []).filter((block) => {
    const start = parseTime(block.booking_start_datetime, date);
    const end = parseTime(block.booking_end_datetime, date);
    return start < dateEnd && end > dateStart;
  });

  console.log(
    "Filtered booked blocks for date:",
    filteredBookedBlocks?.length || 0
  );

  // 7. Combine booked and break blocks
  const combinedBlocks = [...filteredBookedBlocks, ...(breakBlocks || [])];

  // 8. Convert to busy times
  const busyTimes = (combinedBlocks || []).map((block) => [
    parseTime(block.booking_start_datetime || block.leave_start_time, date),
    parseTime(block.booking_end_datetime || block.leave_end_time, date),
  ]);

  // 9. Find available time slots with workstation capability check
  const allFreeSlots = [];

  for (const block of scheduleBlocks || []) {
    const start = parseTime(block.start_time_daily, date);
    const end = parseTime(block.end_time_daily, date);

    const freeBlocks = subtractTimeRanges([start, end], busyTimes);

    // Pre-filter blocks that are too short
    const validFreeBlocks = freeBlocks.filter(
      ([blockStart, blockEnd]) =>
        blockEnd.getTime() - blockStart.getTime() >= totalDuration * 60 * 1000
    );

    console.log(
      `Schedule block ${block.schedule_id}: ${validFreeBlocks.length} valid free blocks`
    );

    // Generate all possible slots first
    const allPossibleSlots = [];
    for (const [blockStart, blockEnd] of validFreeBlocks) {
      const startTime = blockStart.getTime();
      const endTime = blockEnd.getTime();
      const durationMs = totalDuration * 60 * 1000;
      const stepMs = 15 * 60 * 1000;

      const numSlots =
        Math.floor((endTime - startTime - durationMs) / stepMs) + 1;

      for (let i = 0; i < numSlots; i++) {
        const slotStart = new Date(startTime + i * stepMs);
        const slotEnd = new Date(slotStart.getTime() + durationMs);
        allPossibleSlots.push({ start: slotStart, end: slotEnd });
      }
    }

    console.log(
      `Generated ${allPossibleSlots.length} possible slots for schedule block ${block.schedule_id}`
    );

    // Batch check workstation capability and availability
    const availabilityChecks = allPossibleSlots.map((slot) =>
      isCapableWorkstationAvailable(salon_id, service_ids, slot.start, slot.end)
    );

    // Wait for all checks to complete
    const availabilityResults = await Promise.all(availabilityChecks);

    // Filter available slots and add workstation information
    const availableSlots = allPossibleSlots
      .map((slot, index) => ({
        ...slot,
        workstationInfo: availabilityResults[index],
      }))
      .filter((slot) => slot.workstationInfo.available);

    allFreeSlots.push(...availableSlots);
  }

  console.log("Final available slots:", allFreeSlots.length);

  // Return slots with additional workstation information
  return allFreeSlots.map((slot) => ({
    start: slot.start,
    end: slot.end,
    workstation_strategy: slot.workstationInfo.strategy,
    available_workstations: slot.workstationInfo.workstations,
    workstation_count: slot.workstationInfo.workstations.length,
  }));
};

// Function to get all available time slots from all eligible stylists
export const getAllAvailableTimeSlotsForServices = async ({
  service_ids,
  salon_id,
  date,
}) => {
  if (!Array.isArray(service_ids) || !salon_id || !date) {
    throw new Error("Missing required input: service_ids, salon_id, or date");
  }

  console.log("Getting all available slots for:", {
    service_ids,
    salon_id,
    date,
  });

  // 1. Get all eligible stylists for the services using existing function from bookingService
  const { getStylistsForAllServices } = await import("./bookingService.js");
  const eligibleStylists = await getStylistsForAllServices(
    salon_id,
    service_ids
  );

  if (eligibleStylists.length === 0) {
    throw new Error("No stylists available for the selected services");
  }

  // 2. Get time slots for each eligible stylist
  const allTimeSlots = new Map(); // Map<timeSlot, stylistIds[]>

  for (const stylist of eligibleStylists) {
    try {
      const stylistSlots = await getAvailableTimeSlotsSithum({
        service_ids,
        stylist_id: stylist.stylist_id,
        salon_id,
        date,
      });

      // Group slots by time
      stylistSlots.forEach((slot) => {
        const timeKey = `${slot.start.toISOString()}-${slot.end.toISOString()}`;

        if (!allTimeSlots.has(timeKey)) {
          allTimeSlots.set(timeKey, {
            start: slot.start,
            end: slot.end,
            workstation_strategy: slot.workstation_strategy,
            available_workstations: slot.available_workstations,
            available_stylists: [],
          });
        }

        allTimeSlots.get(timeKey).available_stylists.push({
          stylist_id: stylist.stylist_id,
          stylist_name: stylist.stylist_name,
          profile_pic_link: stylist.profile_pic_link,
        });
      });
    } catch (error) {
      console.log(
        `Stylist ${stylist.stylist_id} not available:`,
        error.message
      );
      // Continue with other stylists
    }
  }

  // 3. Convert to array and sort by time
  const availableSlots = Array.from(allTimeSlots.values())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((slot) => ({
      ...slot,
      stylist_count: slot.available_stylists.length,
    }));

  console.log(
    `Found ${availableSlots.length} unique time slots across all stylists`
  );

  return availableSlots;
};

// Helper function to randomly assign a stylist for booking
export const assignRandomStylistForSlot = (availableStylists) => {
  if (!availableStylists || availableStylists.length === 0) {
    throw new Error("No stylists available for this time slot");
  }

  const randomIndex = Math.floor(Math.random() * availableStylists.length);
  return availableStylists[randomIndex];
};
