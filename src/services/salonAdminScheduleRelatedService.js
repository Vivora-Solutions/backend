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
  console.log("Stylists with schedule:", stylistsWithSchedule);

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
  const {
    stylist_id,
    schedule_id,
    day_of_week,
    start_time_daily,
    end_time_daily,
  } = body;

  const adminSalonId = await getSalonIdByAdmin(user_id);

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

  // Perform the update
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
    throw new Error(updateError.message);
  }

  return {
    message: "Schedule updated successfully",
    data,
  };
};

export const handleAddStylistLeave = async (user_id, body) => {
  const { stylist_id, date, leave_start_time, leave_end_time } = body;
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
    throw new Error("You do not have permission to add leave for this stylist");
  }
  // Insert leave record
  const { data: leave, error: leaveError } = await supabase
      .from("stylist_leave_new")
      .insert([{ stylist_id, date, leave_start_time, leave_end_time }])
      .select();
  if (leaveError) {
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
    throw new Error("You do not have permission to edit leave for this stylist");
  }
  // Update leave record
  const { data: updatedLeave, error: updateError } = await supabase
      .from("stylist_leave_new")
      .update({
        date,
        leave_start_time,
        leave_end_time,
        created_at: new Date(),
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
    throw new Error("You do not have permission to delete leave for this stylist");
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
    throw new Error("You do not have permission to view leaves for this stylist");
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


const getSalonIdByAdmin = async (user_id) => {
  const { data, error } = await supabase
      .from("salon")
      .select("salon_id")
      .eq("admin_user_id", user_id)
      .single();

  if (error || !data) throw new Error("Salon not found for this admin");
  return data.salon_id;
};