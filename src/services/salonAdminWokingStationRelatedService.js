import supabase from "../config/supabaseClient.js";

// Get All Working Stations in a Salon
export const handleGetAllWorkingStations = async (user_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data, error } = await supabase
    .from("workstation")
    .select("*")
    .eq("salon_id", salon_id);

  if (error) throw new Error(error.message);
  return { message: "Working stations fetched successfully", data };
};

export const handleCreateWorkingStation = async (user_id, workstation_name) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  // Step 1: Check if salon_id exists
  const { data: salon, error: salonError } = await supabase
    .from("salon")
    .select("salon_id")
    .eq("salon_id", salon_id)
    .single();
  if (salonError || !salon) {
    throw new Error("Invalid salon_id: Salon does not exist.");
  }
  // Step 2: Insert workstation
  const { data, error } = await supabase
    .from("workstation")
    .insert([
      {
        salon_id,
        workstation_name,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select();

  if (error) throw new Error(error.message);
  return { message: "Workstation created successfully", data };
};

// Edit Working Station (e.g., name)
export const handleEditWorkingStation = async (
  user_id,
  workstation_id,
  workstation_name
) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  // Check ownership
  const { data: station, error: fetchErr } = await supabase
    .from("workstation")
    .select("*")
    .eq("workstation_id", workstation_id)
    .eq("salon_id", salon_id)
    .single();

  if (fetchErr) throw new Error("Working station not found or access denied");

  const { data, error } = await supabase
    .from("workstation")
    .update({ workstation_name, updated_at: new Date() })
    .eq("workstation_id", workstation_id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { message: "Working station updated successfully", data };
};

// Get All Services of a Working Station

export const handleGetServicesOfWorkingStation = async (
  user_id,
  station_id
) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  // Ensure the station is in this salon
  const { data: station, error: stationErr } = await supabase
    .from("workstation")
    .select("station_id")
    .eq("station_id", station_id)
    .eq("salon_id", salon_id)
    .single();

  if (stationErr) throw new Error("Working station not found or access denied");

  const { data, error } = await supabase
    .from("workstation_service")
    .select(
      `
      service(
        service_id,
        service_name,
        service_description,
        service_image_link,
        price,
        duration_minutes
      )
    `
    )
    .eq("station_id", station_id)
    .eq("salon_id", salon_id);

  if (error) throw new Error(error.message);
  return { message: "Services fetched successfully", data };
};

// Add or Edit Services for a Working Station
export const handleAddOrEditServicesToWorkingStation = async (
  user_id,
  station_id,
  service_ids
) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  // Ensure the station belongs to the salon
  const { data: station, error: stationErr } = await supabase
    .from("workstation")
    .select("station_id")
    .eq("station_id", station_id)
    .eq("salon_id", salon_id)
    .single();

  if (stationErr) throw new Error("Working station not found or access denied");

  // Fetch services of this salon
  const { data: validServices, error: serviceErr } = await supabase
    .from("service")
    .select("service_id")
    .eq("salon_id", salon_id);

  if (serviceErr) throw new Error("Failed to fetch salon services");

  const validServiceIds = validServices.map((s) => s.service_id);

  const filteredServiceIds = service_ids.filter((id) =>
    validServiceIds.includes(id)
  );

  if (filteredServiceIds.length === 0) {
    throw new Error("No valid services provided for this salon");
  }

  // Remove existing entries to avoid duplicates
  await supabase
    .from("workstation_service")
    .delete()
    .eq("station_id", station_id)
    .eq("salon_id", salon_id);

  // Insert new associations
  const inserts = filteredServiceIds.map((service_id) => ({
    station_id,
    service_id,
    salon_id,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  const { data, error } = await supabase
    .from("workstation_service")
    .insert(inserts)
    .select();

  if (error) throw new Error(error.message);
  return { message: "Services assigned to working station successfully", data };
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
