import supabase from '../config/supabaseClient.js';


// User Services
export const fetchAllUsers = async () => {
    const { data, error } = await supabase
        .from('user')
        .select('user_id, email, role, account_created_at')
        .order('account_created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchUserById = async (userId) => {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateUserService = async (userId, updateData) => {
    const { data, error } = await supabase
        .from('user')
        .update(updateData)
        .eq('user_id', userId)
        .select('user_id, email, role')
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

// export const deleteUserService = async (userId) => {
//     const { error } = await supabase
//         .from('user')
//         .delete()
//         .eq('user_id', userId);
    
//     if (error) throw new Error(error.message);
//     return true;
// };  


// Salon Services
export const fetchAllSalons = async () => {
    const { data, error } = await supabase
        .from('salon')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchSalonById = async (salonId) => {
    const { data, error } = await supabase
        .from('salon')
        .select(`*`)
        .eq('salon_id', salonId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const createSalonService = async (salonData) => {
    const { data, error } = await supabase
        .from('salon')
        .insert(salonData)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateSalonService = async (salonId, updateData) => {
    const { data, error } = await supabase
        .from('salon')
        .update(updateData)
        .eq('salon_id', salonId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};


// export const updateSalonServiceStatus = async (salonId, is_approved) => {
//   const { data, error } = await supabase
//     .from('salon')
//     .update({ is_approved })  // Only update the status field
//     .eq('salon_id', salonId)
//     .select()
//     .single();

//   if (error) throw new Error(error.message);
//   return data;
// };

export const updateSalonServiceStatus = async (salonId, updateData) => {
  const { is_approved } = updateData;

  if (typeof is_approved !== 'boolean') {
    throw new Error("'is_approved' must be a boolean value");
  }

  const { data, error } = await supabase
    .from('salon')
    .update({ is_approved })
    .eq('salon_id', salonId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};






export const deleteSalonService = async (salonId) => {
    const { error } = await supabase
        .from('salon')
        .delete()
        .eq('salon_id', salonId);
    
    if (error) throw new Error(error.message);
    return true;
};

export const approveSalonService = async (salonId, isApproved) => {
    const { data, error } = await supabase
        .from('salon')
        .update({ is_approved: isApproved })
        .eq('salon_id', salonId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

// Stylist Services
export const fetchAllStylists = async () => {
    const { data, error } = await supabase
        .from('stylist')
        .select(`
            *,
            salon(salon_id, salon_name)
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchStylistById = async (stylistId) => {
    const { data, error } = await supabase
        .from('stylist')
        .select(`
            *,
            salon(salon_id, salon_name),
            stylist_work_schedule(*),
            booking(*)
        `)
        .eq('stylist_id', stylistId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchStylistsBySalon = async (salonId) => {
    const { data, error } = await supabase
        .from('stylist')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const createStylistService = async (stylistData) => {
    const { data, error } = await supabase
        .from('stylist')
        .insert(stylistData)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateStylistService = async (stylistId, updateData) => {
    const { data, error } = await supabase
        .from('stylist')
        .update(updateData)
        .eq('stylist_id', stylistId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const deleteStylistService = async (stylistId) => {
    const { error } = await supabase
        .from('stylist')
        .delete()
        .eq('stylist_id', stylistId);
    
    if (error) throw new Error(error.message);
    return true;
};

// Service Services
export const fetchAllServices = async () => {
    const { data, error } = await supabase
        .from('service')
        .select(`
            *,
            salon(salon_id, salon_name)
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchServiceById = async (serviceId, salonId) => {
    const { data, error } = await supabase
        .from('service')
        .select(`
            *,
            salon(salon_id, salon_name)
        `)
        .eq('service_id', serviceId)
        .eq('salon_id', salonId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchServicesBySalon = async (salonId) => {
    const { data, error } = await supabase
        .from('service')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const createServiceService = async (serviceData) => {
    const { data, error } = await supabase
        .from('service')
        .insert(serviceData)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateServiceService = async (serviceId, salonId, updateData) => {
    const { data, error } = await supabase
        .from('service')
        .update(updateData)
        .eq('service_id', serviceId)
        .eq('salon_id', salonId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const deleteServiceService = async (serviceId, salonId) => {
    const { error } = await supabase
        .from('service')
        .delete()
        .eq('service_id', serviceId)
        .eq('salon_id', salonId);
    
    if (error) throw new Error(error.message);
    return true;
};

// Booking Services
export const fetchAllBookings = async () => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            *,
            user(user_id, email, first_name, last_name),
            salon(salon_id, salon_name),
            stylist(stylist_id, stylist_name),
            booking_services(
                *,
                service(service_name)
            )
        `)
        .order('booking_start_datetime', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchBookingById = async (bookingId) => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            *,
            user(user_id, email, first_name, last_name),
            salon(salon_id, salon_name),
            stylist(stylist_id, stylist_name),
            booking_services(
                *,
                service(service_name)
            )
        `)
        .eq('booking_id', bookingId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchBookingsByUser = async (userId) => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            *,
            salon(salon_id, salon_name),
            stylist(stylist_id, stylist_name),
            booking_services(
                *,
                service(service_name)
            )
        `)
        .eq('user_id', userId)
        .order('booking_start_datetime', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchBookingsBySalon = async (salonId) => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            *,
            user(user_id, email, first_name, last_name),
            stylist(stylist_id, stylist_name),
            booking_services(
                *,
                service(service_name)
            )
        `)
        .eq('salon_id', salonId)
        .order('booking_start_datetime', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchBookingsByStylist = async (stylistId) => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            *,
            user(user_id, email, first_name, last_name),
            salon(salon_id, salon_name),
            booking_services(
                *,
                service(service_name)
            )
        `)
        .eq('stylist_id', stylistId)
        .order('booking_start_datetime', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateBookingStatusService = async (bookingId, status) => {
    const { data, error } = await supabase
        .from('booking')
        .update({ status })
        .eq('booking_id', bookingId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const deleteBookingService = async (bookingId) => {
    const { error } = await supabase
        .from('booking')
        .delete()
        .eq('booking_id', bookingId);
    
    if (error) throw new Error(error.message);
    return true;
};

// Customer Services
// export const fetchAllCustomers = async () => {
//     const { data, error } = await supabase
//         .from('customer')
//         .select(`
//             *,
//             user(user_id, email)
//         `)
//         .order('created_at', { ascending: false });
    
//     if (error) throw new Error(error.message);
//     return data;
// };

export const fetchAllCustomers = async () => {
  const { data, error } = await supabase.rpc('get_daily_customer_counts');
  if (error) throw new Error(error.message);
  return data;
};




export const getSalonsPerDayServices  = async () => {
    const { data, error } = await supabase.rpc('get_daily_salons_counts');
    if (error) throw new Error(error.message);
    return data;
};


export const fetchCustomerById = async (customerId) => {
    const { data, error } = await supabase
        .from('customer')
        .select(`
            *,
            user(user_id, email)
        `)
        .eq('customer_id', customerId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateCustomerService = async (customerId, updateData) => {
    const { data, error } = await supabase
        .from('customer')
        .update(updateData)
        .eq('customer_id', customerId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const deleteCustomerService = async (customerId) => {
    const { error } = await supabase
        .from('customer')
        .delete()
        .eq('customer_id', customerId);
    
    if (error) throw new Error(error.message);
    return true;
};

// Work Schedule Services
export const fetchAllWorkSchedules = async () => {
    const { data, error } = await supabase
        .from('stylist_work_schedule')
        .select(`
            *,
            stylist(stylist_id, stylist_name, salon(salon_name))
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchWorkScheduleById = async (scheduleId) => {
    const { data, error } = await supabase
        .from('stylist_work_schedule')
        .select(`
            *,
            stylist(stylist_id, stylist_name, salon(salon_name))
        `)
        .eq('schedule_id', scheduleId)
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchWorkSchedulesByStylist = async (stylistId) => {
    const { data, error } = await supabase
        .from('stylist_work_schedule')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('day_of_week');
    
    if (error) throw new Error(error.message);
    return data;
};

export const createWorkScheduleService = async (scheduleData) => {
    const { data, error } = await supabase
        .from('stylist_work_schedule')
        .insert(scheduleData)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateWorkScheduleService = async (scheduleId, updateData) => {
    const { data, error } = await supabase
        .from('stylist_work_schedule')
        .update(updateData)
        .eq('schedule_id', scheduleId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const deleteWorkScheduleService = async (scheduleId) => {
    const { error } = await supabase
        .from('stylist_work_schedule')
        .delete()
        .eq('schedule_id', scheduleId);
    
    if (error) throw new Error(error.message);
    return true;
};

// Booking Services Services
// export const fetchAllBookingServices = async () => {
//     const { data, error } = await supabase
//         .from('booking_services')
//         .select(`
//             *,
//             booking(
//                 booking_id,
//                 booking_start_datetime,
//                 user(first_name, last_name)
//             ),
//             service(service_name)
//         `)
//         .order('created_at', { ascending: false });
    
//     if (error) throw new Error(error.message);
//     return data;
// };





export const fetchAllBookingServices = async () => {
  const { data, error } = await supabase.rpc('get_daily_customer_counts');
  if (error) throw new Error(error.message);
  return data;
};




export const fetchBookingServicesBySalonId = async (salonId) => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            booking_id,booking_start_datetime,booking_end_datetime,booked_at
        `)
        .eq('salon_id', salonId);
    
    if (error) throw new Error(error.message);
    return data;
};

export const updateBookingServiceService = async (bookingServiceId, updateData) => {
    const { data, error } = await supabase
        .from('booking_services')
        .update(updateData)
        .eq('booking_service_id', bookingServiceId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

export const deleteBookingServiceService2 = async (bookingServiceId) => {
    const { error } = await supabase
        .from('booking_services')
        .delete()
        .eq('booking_service_id', bookingServiceId);
    
    if (error) throw new Error(error.message);
    return true;
};