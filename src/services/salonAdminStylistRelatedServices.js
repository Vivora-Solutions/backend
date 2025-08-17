import supabase from "../config/supabaseClient.js";


//handleGetStylist
export const handleGetStylist = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const { data, error } = await supabase
      .from("stylist")
      .select("*")
      .eq("salon_id", salon_id)
      .eq("stylist_id", stylist_id);


  if (error) throw new Error(error.message);
  return data;
};

export const handleGetAllStylists = async (user_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const { data, error } = await supabase
      .from("stylist")
      .select("*")
      .eq("salon_id", salon_id);

  if (error) throw new Error(error.message);
  return data;
};


// export const handleAddStylist = async (user_id, stylistDetails) => {
//   const salon_id = await getSalonIdByAdmin(user_id);

//   const {
//     stylist_name,
//     stylist_contact_number,
//     profile_pic_link,
//     bio,
//   } = stylistDetails;

//   // Construct insert object
//   const insertData = {
//     stylist_name,
//     stylist_contact_number,
//     bio,
//     salon_id,
//     is_active: true,
//   };

//   // Only include profile_pic_link if it's provided (non-empty)
//   if (profile_pic_link) {
//     insertData.profile_pic_link = profile_pic_link;
//   }

//   const { data, error } = await supabase
//       .from("stylist")
//       .insert([insertData])
//       .select();

//   if (error) throw new Error(error.message);
//   return { message: "Stylist added", data };
// };


export const handleInitialStylistSchedule = async (stylist_id, salon_id) => {
  try {
    // Get salon opening hours
    const { data: openingHours, error: openingHoursError } = await supabase
      .from("salon_opening_hours")
      .select("day_of_week, opening_time, closing_time, is_open")
      .eq("salon_id", salon_id);

    if (openingHoursError) throw new Error(openingHoursError.message);
    
    // Filter only open days and prepare schedule data
    const scheduleData = openingHours
      .filter(day => day.is_open)
      .map(day => ({
        stylist_id,
        day_of_week: day.day_of_week,
        start_time_daily: day.opening_time,
        end_time_daily: day.closing_time
      }));
    
    if (scheduleData.length === 0) return { message: "No open days found for salon" };
    
    // Insert schedule records
    const { data, error } = await supabase
      .from("stylist_work_schedule_new")
      .insert(scheduleData)
      .select();
      
    if (error) throw new Error(error.message);
    
    return { message: "Default schedule created for stylist", data };
  } catch (error) {
    throw new Error(`Failed to create initial schedule: ${error.message}`);
  }
};

// Modified handleAddStylist to include initial schedule creation
export const handleAddStylist = async (user_id, stylistDetails) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  
  const { stylist_name, stylist_contact_number, profile_pic_link, bio } = stylistDetails;
  
  // Construct insert object
  const insertData = {
    stylist_name,
    stylist_contact_number,
    bio,
    salon_id,
    is_active: true,
  };
  
  if (profile_pic_link) {
    insertData.profile_pic_link = profile_pic_link;
  }
  
  // Insert the stylist
  const { data, error } = await supabase
    .from("stylist")
    .insert([insertData])
    .select();
    
  if (error) throw new Error(error.message);
  
  // Create initial schedule
  if (data && data.length > 0) {
    await handleInitialStylistSchedule(data[0].stylist_id, salon_id);
  }
  
  return { message: "Stylist added with default schedule", data };
};


export const handleDisableStylist = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) {
    throw new Error("Unauthorized to delete this stylist");
  }

  const { data, error } = await supabase
      .from("stylist")
      .update({ is_active: false })
      .eq("stylist_id", stylist_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: "Stylist deleted", data };
};

export const handleActivateStylist = async (user_id, stylist_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) {
    throw new Error("Unauthorized to activate this stylist");
  }

  const { data, error } = await supabase
      .from("stylist")
      .update({ is_active: true })
      .eq("stylist_id", stylist_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: "Stylist deleted", data };
};

export const handleUpdateStylistName = async (
    user_id,
    stylist_id,
    new_name
) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error("Unauthorized to update");

  const { data, error } = await supabase
      .from("stylist")
      .update({ stylist_name: new_name, updated_at: new Date() })
      .eq("stylist_id", stylist_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: "Stylist name updated", data };
};

export const handleUpdateStylist = async (
  user_id,
  stylist_id,
  data
) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error("Unauthorized to update");

  const { data2, error } = await supabase
    .from("stylist")
    .update({ ...data, updated_at: new Date() })
    .eq("stylist_id", stylist_id)
    .select();

  if (error) throw new Error(error.message);
  return { message: "Stylist updated", data: data2 };
};




export const handleUpdateStylistContact = async (
    user_id,
    stylist_id,
    new_contact
) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const stylistSalonId = await getStylistSalonId(stylist_id);

  if (salon_id !== stylistSalonId) throw new Error("Unauthorized");

  const { data, error } = await supabase
      .from("stylist")
      .update({ stylist_contact_number: new_contact, updated_at: new Date() })
      .eq("stylist_id", stylist_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: "Contact number updated", data };
};

// export const handleUpdateStylistProfilePic = async (
//     user_id,
//     stylist_id,
//     new_link
// ) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const stylistSalonId = await getStylistSalonId(stylist_id);
//
//   if (salon_id !== stylistSalonId) throw new Error("Unauthorized");
//
//   const { data, error } = await supabase
//       .from("stylist")
//       .update({ profile_pic_link: new_link, updated_at: new Date() })
//       .eq("stylist_id", stylist_id)
//       .select();
//
//   if (error) throw new Error(error.message);
//   return { message: "Profile picture updated", data };
// };
//
// export const handleDeleteStylistProfilePic = async (user_id, stylist_id) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const stylistSalonId = await getStylistSalonId(stylist_id);
//
//   if (salon_id !== stylistSalonId) throw new Error("Unauthorized");
//
//   const { data, error } = await supabase
//       .from("stylist")
//       .update({ profile_pic_link: null, updated_at: new Date() })
//       .eq("stylist_id", stylist_id)
//       .select();
//
//   if (error) throw new Error(error.message);
//   return { message: "Profile picture removed", data };
// };
//
// export const handleUpdateStylistBio = async (user_id, stylist_id, new_bio) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const stylistSalonId = await getStylistSalonId(stylist_id);
//
//   if (salon_id !== stylistSalonId) throw new Error("Unauthorized");
//
//   const { data, error } = await supabase
//       .from("stylist")
//       .update({ bio: new_bio, updated_at: new Date() })
//       .eq("stylist_id", stylist_id)
//       .select();
//
//   if (error) throw new Error(error.message);
//   return { message: "Bio updated", data };
// };
//
// export const handleDeleteStylistBio = async (user_id, stylist_id) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const stylistSalonId = await getStylistSalonId(stylist_id);
//
//   if (salon_id !== stylistSalonId) throw new Error("Unauthorized");
//
//   const { data, error } = await supabase
//       .from("stylist")
//       .update({ bio: null, updated_at: new Date() })
//       .eq("stylist_id", stylist_id)
//       .select();
//
//   if (error) throw new Error(error.message);
//   return { message: "Bio removed", data };
// };

export const handleAddServicesToStylist = async (
    user_id,
    stylist_id,
    service_ids
) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  // 1. Validate stylist belongs to the salon
  const { data: stylist, error: stylistError } = await supabase
      .from("stylist")
      .select("stylist_id")
      .eq("stylist_id", stylist_id)
      .eq("salon_id", salon_id)
      .single();

  if (stylistError || !stylist) {
    throw new Error("Stylist not found in your salon");
  }

  // 2. Validate all services belong to this salon
  const { data: validServices, error: serviceError } = await supabase
      .from("service")
      .select("service_id")
      .in("service_id", service_ids)
      .eq("salon_id", salon_id);

  if (serviceError) throw new Error(serviceError.message);

  const validServiceIds = validServices.map((s) => s.service_id);
  const invalidServiceIds = service_ids.filter(
      (id) => !validServiceIds.includes(id)
  );

  if (invalidServiceIds.length > 0) {
    throw new Error(
        `Invalid services for this salon: ${invalidServiceIds.join(", ")}`
    );
  }

  // 3. Fetch existing stylist_service records
  const { data: existingRecords, error: existingError } = await supabase
      .from("stylist_service")
      .select("service_id, can_be")
      .eq("stylist_id", stylist_id)
      .eq("salon_id", salon_id);

  if (existingError) throw new Error(existingError.message);

  const toUpdate = [];
  const toInsert = [];

  for (const service_id of validServiceIds) {
    const existing = existingRecords.find((rec) => rec.service_id === service_id);

    if (existing) {
      if (existing.can_be === false) {
        toUpdate.push(service_id); // Update to can_be = true
      }
      // If already can_be = true, do nothing
    } else {
      toInsert.push(service_id); // Insert new record
    }
  }

  // 4. Perform updates
  for (const service_id of toUpdate) {
    const { error: updateError } = await supabase
        .from("stylist_service")
        .update({ can_be: true })
        .eq("stylist_id", stylist_id)
        .eq("salon_id", salon_id)
        .eq("service_id", service_id);

    if (updateError) {
      throw new Error(`Failed to re-enable service ${service_id}: ${updateError.message}`);
    }
  }

  // 5. Perform inserts
  if (toInsert.length > 0) {
    const insertData = toInsert.map((service_id) => ({
      stylist_id,
      service_id,
      salon_id,
      can_be: true,
    }));

    const { error: insertError } = await supabase
        .from("stylist_service")
        .insert(insertData);

    if (insertError) throw new Error(insertError.message);
  }

  return {
    message: `Updated ${toUpdate.length}, inserted ${toInsert.length} service(s) for stylist.`,
  };
};


export const handleDisableServicesFromStylist = async (
    user_id,
    stylist_id,
    service_ids
) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { error } = await supabase
      .from("stylist_service")
      .update({ can_be: false, updated_at: new Date().toISOString() }) // update both can_be and updated_at
      .in("service_id", service_ids)
      .eq("stylist_id", stylist_id)
      .eq("salon_id", salon_id);

  if (error) throw new Error(error.message);
  return { message: "Services disabled for stylist" };
};


export const handleGetServicesOfStylist = async (user_id, stylist_id) => {
  // Step 1: Get the salon_id of the admin
  const salon_id = await getSalonIdByAdmin(user_id);
  if (!salon_id) {
    throw new Error("Salon not found for this admin");
  }

  // Step 2: Verify the stylist belongs to the same salon
  const { data: stylistData, error: stylistError } = await supabase
      .from("stylist")
      .select("stylist_id")
      .eq("stylist_id", stylist_id)
      .eq("salon_id", salon_id)
      .single();

  if (stylistError || !stylistData) {
    throw new Error("Stylist does not belong to your salon");
  }

  // Step 3: Fetch assigned services from stylist_service
  const { data, error } = await supabase
      .from("stylist_service")
      .select(
          `
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
    `
      )
      .eq("stylist_id", stylist_id)
      .eq("can_be", true);

  if (error) {
    throw new Error(error.message);
  }

  // Flatten the nested structure
  const services = data.map((entry) => entry.service);
  return services;
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

const getStylistSalonId = async (stylist_id) => {
  const { data, error } = await supabase
      .from("stylist")
      .select("salon_id")
      .eq("stylist_id", stylist_id)
      .single();

  if (error || !data) throw new Error("Stylist not found");
  return data.salon_id;
};