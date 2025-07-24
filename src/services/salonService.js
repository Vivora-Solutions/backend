import supabase from '../config/supabaseClient.js';

export const fetchAllSalon = async () => {
  const { data, error } = await supabase.from('salon').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const fetchSalonById = async (id) => {
  const { data, error } = await supabase.from('salon').select('*').eq('salon_id', id).single();
  if (error) throw new Error('Salon not found');
  return data;
};


export const fetchSalonBannerByID = async (id) => {
  const { data, error } = await supabase.from('banner_images').select('*').eq('salon_id', id).single();
  if (error) throw new Error('Banner  not found');
  return data;
};

export const fetchSalonsByLocation = async ({ lat, lng, radius_km = 5 }) => {
  const { data, error } = await supabase
    .rpc('salons_nearby', {
      lat,
      lng,
      radius_km,
    });

  if (error) throw new Error(error.message);
  return data;
};

export const fetchSalonsByName = async (name) => {
  const { data, error } = await supabase
    .from('salon')
    .select('*')
    .ilike('salon_name', `%${name}%`);
  if (error) throw new Error(error.message);
  return data;
};

// Placeholder, needs a `service_type` column in your salon or a relation table
export const fetchSalonsByService = async (serviceType) => {
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .ilike('salon_description', `%${serviceType}%`);
  if (error) throw new Error(error.message);
  return data;
};

// Assuming `salon_description` or a column includes 'male', 'female', etc.
export const fetchSalonsByType = async (salonId) => {
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .eq('salon_id', salonId);
  if (error) throw new Error(error.message);
  return data;
};

export const fetchStylistsBySalon = async (salonId) => {
  const { data, error } = await supabase
    .from('stylist')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return data;
};

export const fetchStylistAvailability = async (stylistId) => {
  const { data, error } = await supabase
    .from('stylist_work_schedule')
    .select('*')
    .eq('stylist_id', stylistId);
  if (error) throw new Error(error.message);
  return data;
};
