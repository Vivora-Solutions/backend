import supabase from "../config/supabaseClient.js";
import bcrypt from "bcrypt";

import supabaseAdmin from "../config/supabaseAdminClient.js"; // service client

export const registerCustomer = async (body) => {
  const {
    email,
    password,
    first_name,
    last_name,
    date_of_birth,
    location,
    contact_number,
  } = body;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const locationWKT =
    location && location.latitude && location.longitude
      ? `SRID=4326;POINT(${location.longitude} ${location.latitude})`
      : null;

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw new Error(signUpError.message);
  const supabaseUser = authData.user;
  if (!supabaseUser) throw new Error("User registration failed.");

  let userRow;
  try {
    const { data, error: userInsertError } = await supabase
      .from("user")
      .insert({
        user_id: supabaseUser.id,
        email,
        password_hash: hashedPassword,
        role: "customer",
      })
      .select()
      .single();

    if (userInsertError) throw new Error(userInsertError.message);
    userRow = data;

    const { error: customerInsertError } = await supabase
      .from("customer")
      .insert({
        user_id: userRow.user_id,
        first_name,
        last_name,
        date_of_birth,
        location: locationWKT,
        contact_number,
      });

    if (customerInsertError) throw new Error(customerInsertError.message);

    return {
      message:
        "Customer registration successful. Please check your email to confirm.",
      user_id: userRow.user_id,
      role: "customer",
    };
  } catch (err) {
    // Delete Supabase Auth user using service role
    await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
    // Delete user row if created
    if (userRow?.user_id) {
      await supabase.from("user").delete().eq("user_id", userRow.user_id);
    }
    throw new Error(`Customer registration failed: ${err.message}`);
  }
};

export const registerCustomerGoogle = async (body) => {
  const {
    uid,
    email,
    password,
    first_name,
    last_name,
    date_of_birth,
    location,
    contact_number,
  } = body;

  let userRow;
  try {
    const { data, error: userInsertError } = await supabase
      .from("user")
      .insert({
        user_id: uid,
        email,
        password_hash: password,
        role: "customer",
      })
      .select()
      .single();

    if (userInsertError) throw new Error(userInsertError.message);
    userRow = data;

    const { error: customerInsertError } = await supabase
      .from("customer")
      .insert({
        user_id: userRow.user_id,
        first_name,
        last_name,
        date_of_birth,
        location: location,
        contact_number,
      });

    if (customerInsertError) throw new Error(customerInsertError.message);

    return {
      message:
        "Customer registration successful. Please check your email to confirm.",
      user_id: userRow.user_id,
      role: "customer",
    };
  } catch (err) {
    throw new Error(`Customer registration failed: ${err.message}`);
  }
};

export const registerSalon = async (body) => {
  const {
    email,
    password,
    salon_name,
    salon_address,
    salon_description,
    salon_logo_link,
    location,
    contact_number,
  } = body;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const locationWKT =
    location && location.latitude && location.longitude
      ? `SRID=4326;POINT(${location.longitude} ${location.latitude})`
      : null;

  // Step 1: Create Auth User
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw new Error(signUpError.message);
  const supabaseUser = authData.user;
  if (!supabaseUser) throw new Error("User registration failed.");

  let userRow;
  try {
    // Step 2: Insert into user table
    const { data, error: userInsertError } = await supabase
      .from("user")
      .insert({
        user_id: supabaseUser.id,
        email,
        password_hash: hashedPassword,
        role: "salon_admin",
      })
      .select()
      .single();

    if (userInsertError) throw new Error(userInsertError.message);
    userRow = data;

    // Step 3: Insert into salon table
    const { error: salonInsertError } = await supabase.from("salon").insert({
      salon_name,
      location: locationWKT,
      salon_contact_number: contact_number,
      salon_email: email,
      salon_address,
      salon_description,
      salon_logo_link,
      admin_user_id: userRow.user_id,
    });

    if (salonInsertError) throw new Error(salonInsertError.message);

    return {
      message:
        "Salon registration successful. Please check your email to confirm.",
      user_id: userRow.user_id,
      role: "salon_admin",
    };
  } catch (err) {
    // ROLLBACK: Delete auth user
    await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
    // ROLLBACK: Delete user table row if created
    if (userRow?.user_id) {
      await supabase.from("user").delete().eq("user_id", userRow.user_id);
    }
    throw new Error(`Salon registration failed: ${err.message}`);
  }
};

export const handleUserLogin = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  const { data: userRows, error: fetchError } = await supabase
    .from("user")
    .select("user_id, role")
    .eq("email", email);

  if (fetchError) throw new Error(fetchError.message);

  if (!userRows || userRows.length === 0) {
    throw new Error("No user found with this email");
  }

  if (userRows.length > 1) {
    throw new Error("Multiple users found with this email");
  }

  const userRow = userRows[0];

  return {
    message: "Login successful",
    session: data.session,
    customRole: userRow.role,
  };
};

// LOGOUT USER
export const handleUserLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);

  return { message: "Logged out successfully (client should clear token)" };
};

// REFRESH TOKEN
export const handleTokenRefresh = async (refresh_token) => {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error) throw new Error(error.message);

  return {
    message: "Token refreshed successfully",
    session: data.session,
    user: data.user,
  };
};

export const fetchAuthenticatedUserDetails = async (user_id) => {
  const { data, error } = await supabase
    .from("user")
    .select("email, role")
    .eq("user_id", user_id)
    .single();

  if (error) {
    throw new Error("Failed to fetch user details: " + error.message);
  }

  return data;
};

// ...existing code...

export const completeOAuthRegistration = async (
  supabaseUserId,
  userData = {}
) => {
  const {
    email,
    first_name = null,
    last_name = null,
    date_of_birth = null,
    location = null,
    contact_number = null,
  } = userData;

  // Check if user already exists in our custom user table
  const { data: existingUser, error: checkError } = await supabase
    .from("user")
    .select("user_id")
    .eq("user_id", supabaseUserId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(checkError.message);
  }

  // If user already exists, return early
  if (existingUser) {
    return {
      message: "User already exists in system",
      user_id: existingUser.user_id,
      role: "customer",
    };
  }

  // Create location WKT if coordinates provided
  const locationWKT =
    location && location.latitude && location.longitude
      ? `SRID=4326;POINT(${location.longitude} ${location.latitude})`
      : null;

  try {
    // Insert into user table
    const { data: userRow, error: userInsertError } = await supabase
      .from("user")
      .insert({
        user_id: supabaseUserId,
        email,
        password_hash: null, // OAuth users don't have password
        role: "customer",
      })
      .select()
      .single();

    if (userInsertError) throw new Error(userInsertError.message);

    // Insert into customer table
    const { error: customerInsertError } = await supabase
      .from("customer")
      .insert({
        user_id: userRow.user_id,
        first_name,
        last_name,
        date_of_birth,
        location: locationWKT,
        contact_number,
      });

    if (customerInsertError) throw new Error(customerInsertError.message);

    return {
      message: "OAuth user registration completed successfully",
      user_id: userRow.user_id,
      role: "customer",
    };
  } catch (err) {
    throw new Error(`OAuth registration completion failed: ${err.message}`);
  }
};
