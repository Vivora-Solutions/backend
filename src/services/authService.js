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
    contact_number,
  } = body;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // const locationWKT =
  //   location && location.latitude && location.longitude
  //     ? `SRID=4326;POINT(${location.longitude} ${location.latitude})`
  //     : null;

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

// export const registerCustomerGoogle = async (body) => {
//   const {
//     uid,
//     email,
//     password,
//     first_name,
//     last_name,
//     date_of_birth,
//     location,
//     contact_number,
//   } = body;

//   let userRow;
//   try {
//     const { data, error: userInsertError } = await supabase
//       .from("user")
//       .insert({
//         user_id: uid,
//         email,
//         password_hash: password,
//         role: "customer",
//       })
//       .select()
//       .single();

//     if (userInsertError) throw new Error(userInsertError.message);
//     userRow = data;

//     const { error: customerInsertError } = await supabase
//       .from("customer")
//       .insert({
//         user_id: userRow.user_id,
//         first_name,
//         last_name,
//         date_of_birth,
//         location: location,
//         contact_number,
//       });

//     if (customerInsertError) throw new Error(customerInsertError.message);

//     return {
//       message:
//         "Customer registration successful. Please check your email to confirm.",
//       user_id: userRow.user_id,
//       role: "customer",
//     };
//   } catch (err) {
//     throw new Error(`Customer registration failed: ${err.message}`);
//   }
// };

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

  // Check if user already exists by EMAIL (not uid)
  try {
    // First check if user exists in our custom user table by email
    const { data: existingCustomUser, error: customUserError } = await supabase
      .from("user")
      .select("user_id,role")
      .eq("email", email)
      .single();

    if (existingCustomUser) {
      // User already exists in our system
      return {
        message: "User already registered with this email",
        user_id: existingCustomUser.user_id,
        role: existingCustomUser.role,
        exists: true,
      };
    } else if (customUserError && customUserError.code !== "PGRST116") {
      // Some error other than "no rows returned"
      throw new Error(
        `Error checking existing user: ${customUserError.message}`
      );
    }

    // User doesn't exist in our custom tables, proceed with registration
  } catch (checkError) {
    throw new Error(`User verification failed: ${checkError.message}`);
  }

  // Create location WKT if coordinates provided
  const locationWKT =
    location && location.latitude && location.longitude
      ? `SRID=4326;POINT(${location.longitude} ${location.latitude})`
      : null;

  let userRow;
  try {
    const { data, error: userInsertError } = await supabase
      .from("user")
      .insert({
        user_id: uid, // Use the uid from Supabase Auth
        email,
        password_hash: null, // OAuth users don't have password
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
      message: "Google OAuth user registration completed successfully",
      user_id: userRow.user_id,
      role: "customer",
      exists: false,
    };
  } catch (err) {
    // Cleanup: Delete user row if created
    if (userRow?.user_id) {
      await supabase.from("user").delete().eq("user_id", userRow.user_id);
    }
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

    const { data: salonData, error: fetchSalonError } = await supabase
      .from("salon")
      .select("salon_id")
      .eq("admin_user_id", userRow.user_id)
      .single();
    if (fetchSalonError) throw new Error(fetchSalonError.message);

    // Insert default opening hours for all days of the week
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const defaultOpeningHours = daysOfWeek.map((day) => ({
      salon_id: salonData.salon_id,
      day_of_week: day,
      opening_time: "09:00",
      closing_time: "17:00",
    }));

    const { data: openingHoursData, error: openingHoursError } = await supabase
      .from("salon_opening_hours")
      .insert(defaultOpeningHours);

    if (openingHoursError) throw new Error(openingHoursError.message);

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
// ...existing code...

export const handleGoogleOAuthLogin = async (access_token) => {
  try {
    // Verify the access token and get user info from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(access_token);

    if (userError || !user) {
      throw new Error("Invalid Google OAuth session");
    }

    // console.log("🔍 Verified user from token:", user.email);

    // Check if user exists in our custom user table
    const { data: userRow, error: fetchError } = await supabase
      .from("user")
      .select("user_id, role, email")
      .eq("email", user.email)
      .single();

    if (fetchError) {
      throw new Error(
        "User not found in system. Please complete registration first."
      );
    }

    // console.log("✅ Found user in custom table:", userRow);

    // Return the necessary data for frontend login handling
    // We don't need to get a fresh session here, the frontend already has it
    return {
      message: "Google OAuth login successful",
      // Return a mock session structure or just indicate success
      session: {
        access_token: access_token, // Use the token from frontend
        // The frontend already has the refresh_token
      },
      customRole: userRow.role,
      user_id: userRow.user_id,
    };
  } catch (error) {
    console.error("Google OAuth login error:", error);
    throw new Error(`Google OAuth login failed: ${error.message}`);
  }
};

// ...existing code...

export const updateCustomerPhone = async (userId, phoneNumber) => {
  try {
    // Validate phone number (basic validation)
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      throw new Error("Valid phone number is required");
    }

    // Update customer table with phone number
    const { data, error: updateError } = await supabase
      .from("customer")
      .update({
        contact_number: phoneNumber.trim(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      message: "Phone number updated successfully",
      contact_number: data.contact_number,
    };
  } catch (error) {
    throw new Error(`Phone update failed: ${error.message}`);
  }
};

export const getCustomerProfile = async (userId) => {
  try {
    const { data: customer, error } = await supabase
      .from("customer")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return customer;
  } catch (error) {
    throw new Error(`Failed to get customer profile: ${error.message}`);
  }
};

// export const handleGoogleOAuthLogin = async (access_token) => {
//   try {
//     // Get the user from Supabase using the access token
//     const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);

//     if (userError || !user) {
//       throw new Error('Invalid Google OAuth session');
//     }

//     // Check if user exists in our custom user table
//     const { data: userRow, error: fetchError } = await supabase
//       .from("user")
//       .select("user_id, role, email")
//       .eq("email", user.email)
//       .single();

//     if (fetchError) {
//       throw new Error("User not found in system. Please complete registration first.");
//     }

//     // Get a fresh session for the user (this ensures we have the latest session data)
//     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

//     if (sessionError || !sessionData.session) {
//       throw new Error('Failed to get user session');
//     }

//     return {
//       message: "Google OAuth login successful",
//       session: sessionData.session,
//       customRole: userRow.role,
//       user_id: userRow.user_id
//     };
//   } catch (error) {
//     throw new Error(`Google OAuth login failed: ${error.message}`);
//   }
// };

// ...existing code...

// export const completeOAuthRegistration = async (
//   supabaseUserId,
//   userData = {}
// ) => {
//   const {
//     email,
//     first_name = null,
//     last_name = null,
//     date_of_birth = null,
//     location = null,
//     contact_number = null,
//   } = userData;

//   // Check if user already exists in our custom user table
//   const { data: existingUser, error: checkError } = await supabase
//     .from("user")
//     .select("user_id")
//     .eq("user_id", supabaseUserId)
//     .single();

//   if (checkError && checkError.code !== "PGRST116") {
//     throw new Error(checkError.message);
//   }

//   // If user already exists, return early
//   if (existingUser) {
//     return {
//       message: "User already exists in system",
//       user_id: existingUser.user_id,
//       role: "customer",
//     };
//   }

//   // Create location WKT if coordinates provided
//   const locationWKT =
//     location && location.latitude && location.longitude
//       ? `SRID=4326;POINT(${location.longitude} ${location.latitude})`
//       : null;

//   try {
//     // Insert into user table
//     const { data: userRow, error: userInsertError } = await supabase
//       .from("user")
//       .insert({
//         user_id: supabaseUserId,
//         email,
//         password_hash: null, // OAuth users don't have password
//         role: "customer",
//       })
//       .select()
//       .single();

//     if (userInsertError) throw new Error(userInsertError.message);

//     // Insert into customer table
//     const { error: customerInsertError } = await supabase
//       .from("customer")
//       .insert({
//         user_id: userRow.user_id,
//         first_name,
//         last_name,
//         date_of_birth,
//         location: locationWKT,
//         contact_number,
//       });

//     if (customerInsertError) throw new Error(customerInsertError.message);

//     return {
//       message: "OAuth user registration completed successfully",
//       user_id: userRow.user_id,
//       role: "customer",
//     };
//   } catch (err) {
//     throw new Error(`OAuth registration completion failed: ${err.message}`);
//   }
// };
