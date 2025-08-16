import supabase from '../config/supabaseClient.js';;

// Update salon fields
export const handleUpdateSalonDetails = async (user_id, fieldsToUpdate) => {
  // Prevent updating the `is_approved` field
  const { is_approved, ...sanitizedFields } = fieldsToUpdate;

  const { data, error } = await supabase
      .from('salon')
      .update({ ...sanitizedFields, updated_at: new Date() })
      .eq('admin_user_id', user_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Salon details updated successfully', data };
};



// Get all banner images of that salon
export const handleGetBannerImages = async (user_id) => {
  // Step 1: Get the salon_id for the given user_id
  const { data: salonData, error: salonError } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !salonData) {
    throw new Error('Salon not found for this user');
  }

  const salon_id = salonData.salon_id;

  // Step 2: Fetch all banner images for this salon
  const { data: bannerImages, error: imageError } = await supabase
      .from('banner_images',)
      .select('image_link,image_id')
      .eq('salon_id', salon_id);

  if (imageError) {
    throw new Error('Failed to fetch banner images: ' + imageError.message);
  }

  return bannerImages;
};


// Add image to salon gallery
export const handleAddBannerImage = async (user_id, image_link) => {
  // Step 1: Get the salon_id for the given user_id
  const { data: salonData, error: salonError } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !salonData) {
    throw new Error('Salon not found for this user');
  }

  const salon_id = salonData.salon_id;

  // Step 2: Insert the banner image using the retrieved salon_id
  const { data, error } = await supabase
      .from('banner_images')
      .insert([{ salon_id, image_link }])
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Image added to gallery', data };
};


// Delete image from salon gallery only by the owner
export const handleDeleteBannerImage = async (user_id, imageId) => {
  // Step 1: Get the salon_id for the given user_id
  const { data: userSalon, error: salonError } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !userSalon) {
    throw new Error('Salon not found for this user');
  }

  const userSalonId = userSalon.salon_id;

  // Step 2: Get the salon_id of the image
  const { data: imageData, error: imageError } = await supabase
      .from('banner_images')
      .select('salon_id')
      .eq('image_id', imageId)
      .single();

  if (imageError || !imageData) {
    throw new Error('Image not found');
  }

  const imageSalonId = imageData.salon_id;

  // Step 3: Compare salon_ids
  if (userSalonId !== imageSalonId) {
    throw new Error('You are not authorized to delete this image');
  }

  // Step 4: Proceed with deletion
  const { data, error } = await supabase
      .from('banner_images')
      .delete()
      .eq('image_id', imageId)
      .select();

  if (error) throw new Error(error.message);

  return { message: 'Image successfully deleted', data };
};


// Update a single image in salon gallery (only by the owner)
export const handleUpdateBannerImage = async (user_id, imageId, newImageLink) => {
  // Step 1: Get salon_id for the given user_id (admin)
  const { data: userSalon, error: salonError } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !userSalon) {
    throw new Error('Salon not found for this user');
  }

  const userSalonId = userSalon.salon_id;

  // Step 2: Get the salon_id of the image
  const { data: imageData, error: imageError } = await supabase
      .from('banner_images')
      .select('salon_id')
      .eq('image_id', imageId)
      .single();

  if (imageError || !imageData) {
    throw new Error('Image not found');
  }

  const imageSalonId = imageData.salon_id;

  // Step 3: Compare salon_ids
  if (userSalonId !== imageSalonId) {
    throw new Error('You are not authorized to update this image');
  }

  // Step 4: Proceed with update
  const { data, error } = await supabase
      .from('banner_images')
      .update({
        image_link: newImageLink,
        updated_at: new Date()
      })
      .eq('image_id', imageId)
      .select();

  if (error) throw new Error(error.message);

  return { message: 'Image successfully updated', data };
};



export const getSalonDetailsByUserId = async (user_id) => {
  const { data, error } = await supabase
      .from('salon')
      .select(`
      salon_id,
      salon_name,
      salon_contact_number,
      salon_email,
      salon_address,
      salon_description,
      salon_logo_link
    `)
      .eq('admin_user_id', user_id)
      .single();

  if (error || !data) {
    throw new Error('Salon not found for this user');
  }

  return data;
};


export const getSalonAndBannerImagesByUserId = async (user_id) => {
  // 1. Get salon by admin_user_id
  const { data: salon, error: salonError } = await supabase
      .from('salon')
      .select(`
      salon_id,
      salon_name,
      salon_contact_number,
      salon_email,
      salon_address,
      salon_description,
      salon_logo_link,
      is_approved,
      created_at
    `)
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !salon) {
    throw new Error('Salon not found for this user');
  }

  const salonId = salon.salon_id;

  // 2. Fetch banner images for that salon
  const { data: bannerImages, error: bannerError } = await supabase
      .from('banner_images')
      .select(`
      image_id,
      image_link,
      created_at
    `)
      .eq('salon_id', salonId);

  if (bannerError) {
    console.error('[Banner Image Error]', bannerError.message);
    throw new Error('Failed to fetch banner images');
  }

  return {
    ...salon,
    banner_images: bannerImages || [],
  };
};



export const handleUpsertOpeningHoursForWeek = async (user_id, daysData) => {
  // Get the salon_id from the logged-in user
  const { data: salonData, error: salonError } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !salonData) throw new Error('Salon not found for this user');
  const salon_id = salonData.salon_id;

  const upsertData = daysData.map(day => ({
    salon_id,
    day_of_week: day.day_of_week,
    is_open: day.is_open,
    opening_time: day.is_open ? day.opening_time : null,
    closing_time: day.is_open ? day.closing_time : null,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
      .from('salon_opening_hours')
      .upsert(upsertData, { onConflict: ['salon_id', 'day_of_week'] }) // ensures update if exists
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Opening hours updated for the week', data };
};



export const handleGetOpeningHoursForSalon = async (user_id) => {
  // Step 1: Get salon_id for the user
  const { data: salonData, error: salonError } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (salonError || !salonData) throw new Error('Salon not found for this user');
  const salon_id = salonData.salon_id;

  // Step 2: Get all 7 days of opening hours
  const { data, error } = await supabase
      .from('salon_opening_hours')
      .select('*')
      .eq('salon_id', salon_id)
      .order('day_of_week', { ascending: true });

  if (error) throw new Error(error.message);

  return data; // array of opening hour entries (0 to 6)
};




