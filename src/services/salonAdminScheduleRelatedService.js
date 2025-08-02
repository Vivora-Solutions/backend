import supabase from '../config/supabaseClient.js';;

export const handleGetAllStylistsForSalon = async (user_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data: stylists, error } = await supabase
    .from('stylist')
    .select('*')
    .eq('salon_id', salon_id);

  if (error) throw new Error(error.message);
  return { message: 'Stylists fetched successfully', data: stylists };
};

export const handleGetStylistsForSchedule = async (stylist_id) => {
  // console.log("Fetching stylist schedule for ID:", stylist_id);
  // Get basic schedule
  const { data: mainSchedule, error: scheduleError } = await supabase
    .from('stylist_work_schedule')
    .select('*')
    .eq('stylist_id', stylist_id);
  // console.log("Main schedule data:", mainSchedule);
  // Get schedule days
  const { data: scheduleDays, error: daysError } = await supabase
    .from('stylist_schedule_day')
    .select('*')
    .in('schedule_id', mainSchedule?.map(s => s.schedule_id) || []);
  // console.log("Schedule days data:", scheduleDays);
  // Get leave days
  const { data: leaveDays, error: leaveError } = await supabase
    .from('stylist_leave')
    .select('*')
    .eq('stylist_id', stylist_id);
  // console.log("Leave days data:", leaveDays);
  // Combine results manually
  const combinedData = mainSchedule?.map(schedule => ({
    ...schedule,
    stylist_schedule_day: scheduleDays?.filter(day => day.schedule_id === schedule.schedule_id),
    stylist_leave: leaveDays?.filter(leave => leave.stylist_id === schedule.stylist_id)
  }));

  // console.log("Combined schedule data:", combinedData);
  if (scheduleError || daysError || leaveError) {
    throw new Error(scheduleError?.message || daysError?.message || leaveError?.message || 'Error fetching schedule data');
  }
  return { message: 'Stylist fetched successfully', data: combinedData };
};

export const handleToggleStylistActiveStatus = async (user_id, stylist_id, is_active) => {
  const adminSalonId = await getSalonIdByAdmin(user_id);

  const { data: stylist, error } = await supabase
    .from('stylist')
    .select('salon_id')
    .eq('stylist_id', stylist_id)
    .single();

  if (error || !stylist) throw new Error('Stylist not found');

  if (stylist.salon_id !== adminSalonId) {
    throw new Error('You do not have permission to modify this stylist');
  }

  const { data, error: updateError } = await supabase
    .from('stylist')
    .update({ is_active, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (updateError) throw new Error(updateError.message);
  return { message: 'Stylist active status updated', data };
};



export const handleAddStylistSchedule = async (user_id, body) => {
  const { stylist_id, day_of_week, start_time_daily, end_time_daily } = body;

  const adminSalonId = await getSalonIdByAdmin(user_id);

  const { data: stylist, error } = await supabase
    .from('stylist')
    .select('salon_id')
    .eq('stylist_id', stylist_id)
    .single();

  if (error || !stylist) throw new Error('Stylist not found');

  if (stylist.salon_id !== adminSalonId) {
    throw new Error('You do not have permission to add schedule for this stylist');
  }

  const { data, error: insertError } = await supabase
    .from('stylist_work_schedule')
    .insert([{ stylist_id, start_time_daily, end_time_daily }])
    .select();
  if (insertError) throw new Error(insertError.message);
  console.log("New schedule ID:", data[0].schedule_id);
  const { dataPart2, error: insertErrorPart2 } = await supabase
    .from("stylist_schedule_day")
    .insert([{ schedule_id: data[0].schedule_id, day_of_week }])
    .select();
  if (insertErrorPart2) throw new Error(insertErrorPart2.message);
  return { message: 'Schedule added successfully', data };
};


export const handleUpdateStylistSchedule = async (user_id, schedule_id, updateData) => {
  const adminSalonId = await getSalonIdByAdmin(user_id);

  const { data: schedule, error: scheduleError } = await supabase
    .from('stylist_work_schedule')
    .select('stylist_id')
    .eq('schedule_id', schedule_id)
    .single();

  if (scheduleError || !schedule) throw new Error('Schedule not found');

  const { data: stylist, error: stylistError } = await supabase
    .from('stylist')
    .select('salon_id')
    .eq('stylist_id', schedule.stylist_id)
    .single();

  if (stylistError || !stylist) throw new Error('Stylist not found');

  if (stylist.salon_id !== adminSalonId) {
    throw new Error('You do not have permission to update this schedule');
  }

  const { data, error: updateError } = await supabase
    .from('stylist_work_schedule')
    .update({ ...updateData, updated_at: new Date() })
    .eq('schedule_id', schedule_id)
    .select();

  if (updateError) throw new Error(updateError.message);
  return { message: 'Schedule updated successfully', data };
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
