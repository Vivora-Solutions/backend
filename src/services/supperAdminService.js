import supabase from '../config/supabaseClient.js';

export const fetchAllUsers = async () => {
  const { data, error } = await supabase.from('user').select('email, user_id, role','account_created_at','last_active','updated_at');
  if (error) throw new Error(error.message);
  return data;
}

