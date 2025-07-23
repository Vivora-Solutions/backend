import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';

export const handleGetUserEmail = async (userId) => {
  const { data, error } = await supabase
    .from('user')
    .select('email')
    .eq('user_id', userId)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const handleGetUserDetails = async (userId) => {
  const { data: userData, error: userError } = await supabase
    .from('user')
    .select('user_id, email, account_created_at')
    .eq('user_id', userId)
    .single();
    
  if (userError) throw new Error(userError.message);
  
  const { data: customerData, error: customerError } = await supabase
    .from('customer')
    .select('customer_id, first_name, last_name, date_of_birth, location, contact_number, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (customerError) throw new Error(customerError.message);

  return {
    ...userData,
    customer_details: customerData || null
  };
};

export const handleUpdateUserDetails = async (userId, updateData) => {
  const { first_name, last_name, date_of_birth, contact_number, location } = updateData;
  
  // Check if customer record exists
  const { data: existingCustomer, error: checkError } = await supabase
    .from('customer')
    .select('customer_id')
    .eq('user_id', userId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(checkError.message);
  }
  
  let result;
  
  if (existingCustomer) {
    // Update existing customer record
    const { data, error } = await supabase
      .from('customer')
      .update({
        first_name,
        last_name,
        date_of_birth: date_of_birth || null,
        contact_number: contact_number || null,
        location: location || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    result = data;
  } else {
    // Create new customer record
    const { data, error } = await supabase
      .from('customer')
      .insert({
        user_id: userId,
        first_name,
        last_name,
        date_of_birth: date_of_birth || null,
        contact_number: contact_number || null,
        location: location || null
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    result = data;
  }
  
  // Update user's last_active timestamp
  await supabase
    .from('user')
    .update({ last_active: new Date().toISOString() })
    .eq('user_id', userId);
    
  return result;
};

export const handleUpdateUserPassword = async (userId, currentPassword, newPassword) => {
  // Get current password hash
  const { data: userData, error: getUserError } = await supabase
    .from('user')
    .select('password_hash')
    .eq('user_id', userId)
    .single();
    
  if (getUserError) throw new Error(getUserError.message);
  
  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, userData.password_hash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
  
  // Update password
  const { error: updateError } = await supabase
    .from('user')
    .update({
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (updateError) throw new Error(updateError.message);
  
  return true;
};