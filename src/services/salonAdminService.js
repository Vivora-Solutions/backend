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
    ]);

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
    .eq('stylist_id', stylist_id);

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
    .eq('stylist_id', stylist_id);

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
    .eq('stylist_id', stylist_id);

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
    .eq('stylist_id', stylist_id);

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
    .eq('stylist_id', stylist_id);

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
    .eq('stylist_id', stylist_id);

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
    .eq('stylist_id', stylist_id);

  if (error) throw new Error(error.message);
  return { message: 'Bio removed', data };
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
