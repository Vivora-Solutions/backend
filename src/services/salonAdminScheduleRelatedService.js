// import supabase from '../config/supabaseClient.js';;
//
// export const handleGetAllStylistsForSalon = async (user_id) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//
//   const { data: stylists, error } = await supabase
//     .from('stylist')
//     .select('*')
//     .eq('salon_id', salon_id);
//
//   if (error) throw new Error(error.message);
//   return { message: 'Stylists fetched successfully', data: stylists };
// };
//
//
// export const handleToggleStylistActiveStatus = async (user_id, stylist_id, is_active) => {
//   const adminSalonId = await getSalonIdByAdmin(user_id);
//
//   const { data: stylist, error } = await supabase
//     .from('stylist')
//     .select('salon_id')
//     .eq('stylist_id', stylist_id)
//     .single();
//
//   if (error || !stylist) throw new Error('Stylist not found');
//
//   if (stylist.salon_id !== adminSalonId) {
//     throw new Error('You do not have permission to modify this stylist');
//   }
//
//   const { data, error: updateError } = await supabase
//     .from('stylist')
//     .update({ is_active, updated_at: new Date() })
//     .eq('stylist_id', stylist_id)
//     .select();
//
//   if (updateError) throw new Error(updateError.message);
//   return { message: 'Stylist active status updated', data };
// };
//
//
//
// export const handleAddStylistSchedule = async (user_id, body) => {
//   const { stylist_id, day_of_week, start_time_daily, end_time_daily } = body;
//
//   const adminSalonId = await getSalonIdByAdmin(user_id);
//
//   const { data: stylist, error } = await supabase
//     .from('stylist')
//     .select('salon_id')
//     .eq('stylist_id', stylist_id)
//     .single();
//
//   if (error || !stylist) throw new Error('Stylist not found');
//
//   if (stylist.salon_id !== adminSalonId) {
//     throw new Error('You do not have permission to add schedule for this stylist');
//   }
//
//   const { data, error: insertError } = await supabase
//     .from('stylist_work_schedule')
//     .insert([{ stylist_id, day_of_week, start_time_daily, end_time_daily }])
//     .select();
//
//   if (insertError) throw new Error(insertError.message);
//   return { message: 'Schedule added successfully', data };
// };
//
//
// export const handleUpdateStylistSchedule = async (user_id, schedule_id, updateData) => {
//   const adminSalonId = await getSalonIdByAdmin(user_id);
//
//   const { data: schedule, error: scheduleError } = await supabase
//     .from('stylist_work_schedule')
//     .select('stylist_id')
//     .eq('schedule_id', schedule_id)
//     .single();
//
//   if (scheduleError || !schedule) throw new Error('Schedule not found');
//
//   const { data: stylist, error: stylistError } = await supabase
//     .from('stylist')
//     .select('salon_id')
//     .eq('stylist_id', schedule.stylist_id)
//     .single();
//
//   if (stylistError || !stylist) throw new Error('Stylist not found');
//
//   if (stylist.salon_id !== adminSalonId) {
//     throw new Error('You do not have permission to update this schedule');
//   }
//
//   const { data, error: updateError } = await supabase
//     .from('stylist_work_schedule')
//     .update({ ...updateData, updated_at: new Date() })
//     .eq('schedule_id', schedule_id)
//     .select();
//
//   if (updateError) throw new Error(updateError.message);
//   return { message: 'Schedule updated successfully', data };
// };
//
//
// const getSalonIdByAdmin = async (user_id) => {
//   const { data, error } = await supabase
//     .from('salon')
//     .select('salon_id')
//     .eq('admin_user_id', user_id)
//     .single();
//
//   if (error || !data) throw new Error('Salon not found for this admin');
//   return data.salon_id;
// };

import e from "express";
import supabase from "../config/supabaseClient.js";

export const handleGetAllStylistsForSalon = async (user_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: stylists, error } = await supabase
    .from("stylist")
    .select("*")
    .eq("salon_id", salon_id);

  if (error) throw new Error(error.message);
  return { message: "Stylists fetched successfully", data: stylists };
};

export const handleGetStylistsWithSchedule = async (user_id, stylist_id) => {
  // Fetch stylist details
  const salon_id = await getSalonIdByAdmin(user_id);
  const { data: stylist, error: stylistError } = await supabase
    .from("stylist")
    .select("*")
    .eq("stylist_id", stylist_id)
    .eq("salon_id", salon_id)
    .single();

  if (stylistError) throw new Error(stylistError.message);

  // Fetch schedule for the stylist
  const { data: schedule, error: scheduleError } = await supabase
    .from("stylist_work_schedule_new")
    .select("*")
    .eq("stylist_id", stylist_id);

  if (scheduleError) throw new Error(scheduleError.message);

  const stylistWithSchedule = { ...stylist, schedule };

  console.log("Stylist with schedule:", stylistWithSchedule);

  return {
    message: "Stylist schedule fetched successfully",
    data: stylistWithSchedule,
  };
};

export const handleGetAllStylistsWithSchedule = async (user_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: stylists, error } = await supabase
    .from("stylist")
    .select("*")
    .eq("salon_id", salon_id);

  if (error) throw new Error(error.message);

  // Fetch schedules for each stylist
  const stylistsWithSchedule = await Promise.all(
    stylists.map(async (stylist) => {
      const { data: schedule, error: scheduleError } = await supabase
        .from("stylist_work_schedule_new")
        .select("*")
        .eq("stylist_id", stylist.stylist_id);

      if (scheduleError) throw new Error(scheduleError.message);

      return { ...stylist, schedule };
    })
  );
  //console.log("Stylists with schedule:", stylistsWithSchedule);

  return {
    message: "Stylists with schedule fetched successfully",
    data: stylistsWithSchedule,
  };
};

export const handleToggleStylistActiveStatus = async (
  user_id,
  stylist_id,
  is_active
) => {
  const adminSalonId = await getSalonIdByAdmin(user_id);

  const { data: stylist, error } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();

  if (error || !stylist) throw new Error("Stylist not found");

  if (stylist.salon_id !== adminSalonId) {
    throw new Error("You do not have permission to modify this stylist");
  }

  const { data, error: updateError } = await supabase
    .from("stylist")
    .update({ is_active, updated_at: new Date() })
    .eq("stylist_id", stylist_id)
    .select();

  if (updateError) throw new Error(updateError.message);
  return { message: "Stylist active status updated", data };
};

export const handleAddStylistSchedule = async (user_id, body) => {
  const { stylist_id, day_of_week, start_time_daily, end_time_daily } = body;

  const adminSalonId = await getSalonIdByAdmin(user_id);

  const { data: stylist, error } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();

  if (error || !stylist) throw new Error("Stylist not found");

  if (stylist.salon_id !== adminSalonId) {
    throw new Error(
      "You do not have permission to add schedule for this stylist"
    );
  }

  const { data, error: insertError } = await supabase
    .from("stylist_work_schedule_new")
    .insert([{ stylist_id, start_time_daily, end_time_daily, day_of_week }])
    .select();
  if (insertError) throw new Error(insertError.message);

  return { message: "Schedule added successfully", data };
};

// export const handleUpdateStylistSchedule = async (
//   user_id,
//   schedule_id,
//   updateData
// ) => {
//   const adminSalonId = await getSalonIdByAdmin(user_id);

//   const { data: schedule, error: scheduleError } = await supabase
//     .from("stylist_work_schedule")
//     .select("stylist_id")
//     .eq("schedule_id", schedule_id)
//     .single();

//   if (scheduleError || !schedule) throw new Error("Schedule not found");

//   const { data: stylist, error: stylistError } = await supabase
//     .from("stylist")
//     .select("salon_id")
//     .eq("stylist_id", schedule.stylist_id)
//     .single();

//   if (stylistError || !stylist) throw new Error("Stylist not found");

//   if (stylist.salon_id !== adminSalonId) {
//     throw new Error("You do not have permission to update this schedule");
//   }

//   const { data, error: updateError } = await supabase
//     .from("stylist_work_schedule")
//     .update({ ...updateData, updated_at: new Date() })
//     .eq("schedule_id", schedule_id)
//     .select();

//   if (updateError) throw new Error(updateError.message);
//   return { message: "Schedule updated successfully", data };
// };

// const getSalonIdByAdmin = async (user_id) => {
//   const { data, error } = await supabase
//     .from("salon")
//     .select("salon_id")
//     .eq("admin_user_id", user_id)
//     .single();

//   if (error || !data) throw new Error("Salon not found for this admin");
//   return data.salon_id;
// };

export const handleUpdateStylistSchedule = async (user_id, body) => {
  console.log("Daminduuuuuuu" + body);
  const {
    stylist_id,
    schedule_id,
    day_of_week,
    start_time_daily,
    end_time_daily,
  } = body;

  const adminSalonId = await getSalonIdByAdmin(user_id);
  console.log("Stylists with schedule:", stylist_id, schedule_id);

  // Check if schedule exists and belongs to this stylist
  const { data: schedule, error: scheduleError } = await supabase
    .from("stylist_work_schedule_new")
    .select("stylist_id")
    .eq("schedule_id", schedule_id)
    .single();

  if (scheduleError || !schedule) {
    throw new Error("Schedule not found");
  }

  if (schedule.stylist_id !== stylist_id) {
    throw new Error("Stylist ID mismatch with schedule");
  }

  // Check if stylist belongs to admin's salon
  const { data: stylist, error: stylistError } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();

  if (stylistError || !stylist) {
    throw new Error("Stylist not found");
  }

  if (stylist.salon_id !== adminSalonId) {
    throw new Error("You do not have permission to update this schedule");
  }
  console.log("Stylist with schedule:", stylist_id, schedule_id);

  // Perform the update
  console.log("Stylist with schedule fetched successfully", day_of_week);
  const { data, error: updateError } = await supabase
    .from("stylist_work_schedule_new")
    .update({
      day_of_week,
      start_time_daily,
      end_time_daily,
      updated_at: new Date(),
    })
    .eq("schedule_id", schedule_id)
    .select();

  if (updateError) {
    console.log(updateError.message);
    throw new Error(updateError.message);
  }

  return {
    message: "Schedule updated successfully",
    data,
  };
};

export const handleAddStylistLeave = async (user_id, body) => {
  console.log("Starting handleAddStylistLeave with:", { user_id, body });

  const { stylist_id, date, leave_start_time, leave_end_time } = body;
  const adminSalonId = await getSalonIdByAdmin(user_id);

  console.log("Admin salon ID:", adminSalonId);

  // Check if stylist belongs to admin's salon
  const { data: stylist, error: stylistError } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();

  console.log("Stylist query result:", { stylist, stylistError });

  if (stylistError || !stylist) {
    throw new Error("Stylist not found");
  }
  if (stylist.salon_id !== adminSalonId) {
    throw new Error("You do not have permission to add leave for this stylist");
  }

  console.log("About to check bookings for date:", date);

  // Check for conflicting bookings
  const { data: conflictingBookings, error: bookingError } = await supabase
    .from("booking")
    .select("booking_id, booking_start_datetime, booking_end_datetime")
    .eq("stylist_id", stylist_id)
    .gte("booking_start_datetime", `${date}T00:00:00+00`)
    .lte("booking_start_datetime", `${date}T23:59:59+00`)
    .in("status", ["confirmed", "pending"]);

  console.log("Booking query result:", { conflictingBookings, bookingError });

  if (bookingError) {
    console.error("Booking error details:", bookingError);
    throw new Error("Error checking for conflicting bookings");
  }

  // Check if leave time overlaps with any booking
  if (conflictingBookings && conflictingBookings.length > 0) {
    console.log("Found conflicting bookings, checking overlap...");

    const hasConflict = conflictingBookings.some((booking) => {
      // Extract UTC time from leave datetime strings
      const leaveStartTime = new Date(leave_start_time)
        .toISOString()
        .substring(11, 19);
      const leaveEndTime = new Date(leave_end_time)
        .toISOString()
        .substring(11, 19);

      // Extract UTC time from booking datetime
      const bookingStartTime = new Date(booking.booking_start_datetime)
        .toISOString()
        .substring(11, 19);
      const bookingEndTime = new Date(booking.booking_end_datetime)
        .toISOString()
        .substring(11, 19);

      console.log("Comparing UTC times:", {
        leaveStartTime,
        leaveEndTime,
        bookingStartTime,
        bookingEndTime,
      });

      return leaveStartTime < bookingEndTime && leaveEndTime > bookingStartTime;
    });

    if (hasConflict) {
      throw new Error(
        "Cannot add leave: There are existing bookings during this time period"
      );
    }
  }

  console.log("No conflicts found, inserting leave...");

  // Create proper datetime strings for database insertion (keep as UTC)
  const leaveStartDateTime = `${date}T${new Date(leave_start_time)
    .toISOString()
    .substring(11, 19)}+00`;
  const leaveEndDateTime = `${date}T${new Date(leave_end_time)
    .toISOString()
    .substring(11, 19)}+00`;

  // Insert leave record with proper datetime format
  const { data: leave, error: leaveError } = await supabase
    .from("stylist_leave_new")
    .insert([
      {
        stylist_id,
        date,
        leave_start_time: leaveStartDateTime,
        leave_end_time: leaveEndDateTime,
      },
    ])
    .select();

  console.log("Leave insert result:", { leave, leaveError });

  if (leaveError) {
    console.error("Leave error details:", leaveError);
    throw new Error(leaveError.message);
  }

  return {
    message: "Leave added successfully",
    data: leave,
  };
};

export const handleEditStylistLeave = async (user_id, body) => {
  const { stylist_id, leave_id, date, leave_start_time, leave_end_time } = body;
  const adminSalonId = await getSalonIdByAdmin(user_id);

  // Check if stylist belongs to admin's salon
  const { data: stylist, error: stylistError } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();
  if (stylistError || !stylist) {
    throw new Error("Stylist not found");
  }
  if (stylist.salon_id !== adminSalonId) {
    throw new Error(
      "You do not have permission to edit leave for this stylist"
    );
  }

  // Check for conflicting bookings (excluding current leave being edited)
  const { data: conflictingBookings, error: bookingError } = await supabase
    .from("booking")
    .select("booking_id, booking_start_datetime, booking_end_datetime")
    .eq("stylist_id", stylist_id)
    .gte("booking_start_datetime", `${date}T00:00:00+00`)
    .lte("booking_start_datetime", `${date}T23:59:59+00`)
    .in("booking_status", ["confirmed", "pending"]);

  if (bookingError) {
    throw new Error("Error checking for conflicting bookings");
  }

  // Check if leave time overlaps with any booking
  if (conflictingBookings && conflictingBookings.length > 0) {
    const hasConflict = conflictingBookings.some((booking) => {
      // Extract time from datetime
      const bookingStartTime = new Date(booking.booking_start_datetime)
        .toTimeString()
        .substring(0, 8);
      const bookingEndTime = new Date(booking.booking_end_datetime)
        .toTimeString()
        .substring(0, 8);

      // Check if leave time overlaps with booking time
      return (
        leave_start_time < bookingEndTime && leave_end_time > bookingStartTime
      );
    });

    if (hasConflict) {
      throw new Error(
        "Cannot update leave: There are existing bookings during this time period"
      );
    }
  }

  // Update leave record
  const { data: updatedLeave, error: updateError } = await supabase
    .from("stylist_leave_new")
    .update({
      date,
      leave_start_time,
      leave_end_time,
      updated_at: new Date(),
    })
    .eq("leave_id", leave_id)
    .select();

  if (updateError) {
    throw new Error(updateError.message);
  }
  return {
    message: "Leave updated successfully",
    data: updatedLeave,
  };
};

export const handleDeleteStylistLeave = async (user_id, body) => {
  const { stylist_id, leave_id } = body;
  const adminSalonId = await getSalonIdByAdmin(user_id);

  // Check if stylist belongs to admin's salon
  const { data: stylist, error: stylistError } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();

  if (stylistError || !stylist) {
    throw new Error("Stylist not found");
  }

  if (stylist.salon_id !== adminSalonId) {
    throw new Error(
      "You do not have permission to delete leave for this stylist"
    );
  }

  // Delete leave record
  const { data, error: deleteError } = await supabase
    .from("stylist_leave_new")
    .delete()
    .eq("leave_id", leave_id)
    .select();

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return {
    message: "Leave deleted successfully",
    data,
  };
};

export const handleGetAllLeavesForStylist = async (user_id, stylist_id) => {
  const adminSalonId = await getSalonIdByAdmin(user_id);

  // Check if stylist belongs to admin's salon
  const { data: stylist, error: stylistError } = await supabase
    .from("stylist")
    .select("salon_id")
    .eq("stylist_id", stylist_id)
    .single();

  if (stylistError || !stylist) {
    throw new Error("Stylist not found");
  }

  if (stylist.salon_id !== adminSalonId) {
    throw new Error(
      "You do not have permission to view leaves for this stylist"
    );
  }

  // Fetch all leaves for the stylist
  const { data: leaves, error: leavesError } = await supabase
    .from("stylist_leave_new")
    .select("*")
    .eq("stylist_id", stylist_id);

  if (leavesError) {
    throw new Error(leavesError.message);
  }

  return {
    message: "Leaves fetched successfully",
    data: leaves,
  };
};

export const handleGetAllLeavesForSalon = async (user_id) => {
  const adminSalonId = await getSalonIdByAdmin(user_id);

  // Get all stylists for this salon
  const { data: stylists, error: stylistsError } = await supabase
    .from("stylist")
    .select("stylist_id")
    .eq("salon_id", adminSalonId);

  if (stylistsError) {
    throw new Error(stylistsError.message);
  }

  // Extract stylist IDs
  const stylistIds = stylists.map((stylist) => stylist.stylist_id);

  // Fetch all leaves for stylists in this salon
  const { data: leaves, error: leavesError } = await supabase
    .from("stylist_leave_new")
    .select("*")
    .in("stylist_id", stylistIds);

  if (leavesError) {
    throw new Error(leavesError.message);
  }

  return {
    message: "All leaves for salon fetched successfully",
    data: leaves,
  };
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
