// src/services/userService.js
import supabase from '../config/supabaseClient.js';

export const fetchUsers = async () => {
  const { data, error } = await supabase.from('user').select('*');
  if (error) throw new Error(error.message);
  return data;
};
