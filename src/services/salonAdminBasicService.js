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


