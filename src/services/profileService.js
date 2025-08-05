import supabase from '../config/supabaseClient.js';

export const fetchAuthenticatedUserDetailsAndProfile = async (user_id) => {
    const { data, error } = await supabase
        .from('user')
        .select(`
      email,
      customer (
        first_name,
        last_name,
        date_of_birth,
        contact_number,
        location
      )
    `)
        .eq('user_id', user_id)
        .single();

    if (error) {
        throw new Error('Failed to fetch user and customer details: ' + error.message);
    }

    return data;
};


export const updateUserAndCustomerProfile = async (user_id, userData = {}, customerData = {}) => {
    const updates = [];

    if (Object.keys(userData).length > 0) {
        updates.push(
            supabase
                .from('user')
                .update({ ...userData, updated_at: new Date().toISOString() })
                .eq('user_id', user_id)
        );
    }

    if (Object.keys(customerData).length > 0) {
        updates.push(
            supabase
                .from('customer')
                .update({ ...customerData, updated_at: new Date().toISOString() })
                .eq('user_id', user_id)
        );
    }

    const results = await Promise.all(updates);
    for (const result of results) {
        if (result.error) {
            throw new Error('Failed to update profile: ' + result.error.message);
        }
    }

    return { message: 'User and customer profile updated successfully' };
};
