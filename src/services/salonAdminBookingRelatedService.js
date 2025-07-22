import supabase from '../config/supabaseClient.js';;


export const handleCreateBooking = async (user_id, bookingData) => {
  const {
    stylist_id,
    booking_start_datetime,
    booked_mode = 'online',
    notes,
    services = [] // Array of { service_id, service_price_at_booking, service_duration_at_booking, notes? }
  } = bookingData;

  if (!services || services.length === 0) {
    throw new Error('At least one service is required to create a booking.');
  }

  const salon_id = await getSalonIdByAdmin(user_id);

  // Start transaction
  const { data: booking, error: bookingError } = await supabase
    .from('booking')
    .insert([
      {
        user_id,
        salon_id,
        stylist_id,
        booking_start_datetime,
        booked_mode,
        notes,
      }
    ])
    .select()
    .single();

  if (bookingError || !booking) throw new Error('Booking creation failed');

  const bookingServicesPayload = services.map(service => ({
    booking_id: booking.booking_id,
    service_id: service.service_id,
    salon_id,
    service_price_at_booking: service.service_price_at_booking,
    service_duration_at_booking: service.service_duration_at_booking,
    notes: service.notes || '',
  }));

  const { error: servicesError } = await supabase
    .from('booking_services')
    .insert(bookingServicesPayload);

  if (servicesError) throw new Error('Failed to add services to booking');

  return { message: 'Booking created successfully', booking };
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

