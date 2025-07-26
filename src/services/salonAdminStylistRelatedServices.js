import supabase from '../config/supabaseClient.js';;

// Add stylist to salon (only by the owner)
export const handleAddStylist = async (user_id, stylistDetails) => {
  
  const salon_id = await getSalonIdByAdmin(user_id);

  const { stylist_name, stylist_contact_number, profile_pic_link, bio } = stylistDetails;

  const { data, error } = await supabase
    .from('stylist')
    .insert([
      {
        stylist_name,
        stylist_contact_number,
        profile_pic_link,
        bio,
        salon_id,
        is_active: true
      }
    ])
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Stylist added', data };
};



export const handleDeleteStylist = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) {
    throw new Error('Unauthorized to delete this stylist');
  }

  const { data, error } = await supabase
    .from('stylist')
    .delete()
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Stylist deleted', data };
};



export const handleUpdateStylistName = async (user_id, stylist_id, new_name) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error('Unauthorized to update');

  const { data, error } = await supabase
    .from('stylist')
    .update({ stylist_name: new_name, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Stylist name updated', data };
};


export const handleUpdateStylistContact = async (user_id, stylist_id, new_contact) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('stylist')
    .update({ stylist_contact_number: new_contact, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Contact number updated', data };
};


export const handleUpdateStylistProfilePic = async (user_id, stylist_id, new_link) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('stylist')
    .update({ profile_pic_link: new_link, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Profile picture updated', data };
};



export const handleDeleteStylistProfilePic = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('stylist')
    .update({ profile_pic_link: null, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Profile picture removed', data };
};


export const handleUpdateStylistBio = async (user_id, stylist_id, new_bio) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('stylist')
    .update({ bio: new_bio, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Bio updated', data };
};



export const handleDeleteStylistBio = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('stylist')
    .update({ bio: null, updated_at: new Date() })
    .eq('stylist_id', stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: 'Bio removed', data };
};


export const handleAddServicesToStylist = async (user_id, stylist_id, service_ids) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const entries = service_ids.map(service_id => ({
    stylist_id,
    service_id,
    salon_id,
    created_at: new Date(),
    updated_at: new Date()
  }));

  const { data, error } = await supabase
      .from('stylist_service')
      .upsert(entries, { ignoreDuplicates: true }) // avoid conflict if already exists
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Services added to stylist', data };
};

export const handleDeleteServicesFromStylist = async (user_id, stylist_id, service_ids) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { error } = await supabase
      .from('stylist_service')
      .delete()
      .in('service_id', service_ids)
      .eq('stylist_id', stylist_id)
      .eq('salon_id', salon_id);

  if (error) throw new Error(error.message);
  return { message: 'Services removed from stylist' };
};

export const handleGetServicesOfStylist = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data, error } = await supabase
      .from('stylist_service')
      .select(`
      service(
        service_id,
        service_name,
        service_description,
        service_image_link,
        price,
        duration_minutes,
        service_category,
        show_price,
        is_available
      )
    `)
      .eq('stylist_id', stylist_id)
      .eq('salon_id', salon_id);

  if (error) throw new Error(error.message);

  // flatten and return the service details only
  const services = data.map(entry => entry.service);
  return services;
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

const getStylistSalonId = async (stylist_id) => {
  const { data, error } = await supabase
    .from('stylist')
    .select('salon_id')
    .eq('stylist_id', stylist_id)
    .single();

  if (error || !data) throw new Error('Stylist not found');
  return data.salon_id;
};
