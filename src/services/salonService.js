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

export const fetchSalonsByLocation = async ({ latitude, longitude }, radius = 5000) => {
  if (!latitude || !longitude) {
    throw new Error("Latitude and longitude are required");
  }

  const { data, error } = await supabase
    .rpc("get_salons_nearby", {
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



export const fetchSalonsByServiceName = async (serviceName) => {
  if (!serviceName || typeof serviceName !== 'string') {
    throw { status: 400, message: 'Invalid or missing service name' };
  }

  const { data, error } = await supabase
    .from('service')
    .select(`
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
    `)
    .ilike('service_name', `%${serviceName}%`)
    .eq('is_available', true);

  if (error) {
    console.error('Supabase error:', error.message);
    throw { status: 500, message: 'Database query failed' };
  }

  if (!data || data.length === 0) {
    throw { status: 404, message: 'No salons found for the given service' };
  }

  return data;
};

