import supabase from '../config/supabaseClient.js';

export const handleUserRegistration = async (body) => {
  const { email, password, role, first_name, last_name, salon_name, salon_email, salon_address } = body;

  // 1. Create user with Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw new Error(signUpError.message);
  const supabaseUser = authData.user;

  if (!supabaseUser) throw new Error('User registration failed.');

  // 2. Insert into "user" table
  const { data: userRow, error: userInsertError } = await supabase
    .from('user')
    .insert({
      user_id: supabaseUser.id,
      email,
      password_hash: password,
      role,
    })
    .select()
    .single();

  if (userInsertError) throw new Error(userInsertError.message);

  // 3. Insert into customer or salon table
  if (role === 'customer') {
    const { error: customerInsertError } = await supabase
      .from('customer')
      .insert({
        user_id: userRow.user_id,
        first_name,
        last_name,
      });

    if (customerInsertError) throw new Error(customerInsertError.message);
  } else if (role === 'salon_admin') {
    const { error: salonInsertError } = await supabase
      .from('salon')
      .insert({
        salon_name,
        salon_email,
        salon_address,
        admin_user_id: userRow.user_id,
      });

    if (salonInsertError) throw new Error(salonInsertError.message);
  }

  return {
    message: 'Registration successful. Please check your email to confirm.',
    user_id: userRow.user_id,
    role,
  };
};



export const handleUserLogin = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  // Optional: fetch user's role from your "user" table
  const { data: userRow, error: fetchError } = await supabase
    .from('user')
    .select('user_id, role')
    .eq('email', email)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  return {
    message: 'Login successful',
    session: data.session,        // contains access_token, refresh_token
    user: data.user,              // supabase user object
    customRole: userRow.role,     // from your custom table
  };
};

/**
 * LOGOUT USER
 */
export const handleUserLogout = async () => {
  const { error } = await supabase.auth.signOut(); // Symbolic — client should remove token
  if (error) throw new Error(error.message);

  return { message: 'Logged out successfully (client should clear token)' };
};

/**
 * REFRESH TOKEN
 */
export const handleTokenRefresh = async (refresh_token) => {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error) throw new Error(error.message);

  return {
    message: 'Token refreshed successfully',
    session: data.session,
    user: data.user,
  };
};