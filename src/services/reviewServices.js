import supabase from '../config/supabaseClient.js';


//handleGetReviews
export const handleGetReviews = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
      .from('customer_reviews')
      .select(`
      review_text,
      star_rating,
      created_at,
      updated_at,
      salon (
        salon_name
      ),
      user (
        customer (
          first_name
        )
      )
    `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};


export const handleCreateReview = async (userId, reviewData) => {
  const { booking_id, salon_id, review_text, star_rating } = reviewData;
  
  // Check if the booking exists and belongs to the user
  const { data: booking, error: bookingError } = await supabase
    .from('booking')
    .select('booking_id, status, salon_id')
    .eq('booking_id', booking_id)
    .eq('user_id', userId)
    .single();
    
  if (bookingError) {
    if (bookingError.code === 'PGRST116') {
      throw new Error('Booking not found');
    }
    throw new Error(bookingError.message);
  }
  
  // Only allow reviews for completed bookings
  if (booking.status !== 'completed') {
    throw new Error('Reviews can only be created for completed bookings');
  }
  
  // Verify salon_id matches the booking
  if (booking.salon_id !== salon_id) {
    throw new Error('Salon ID does not match the booking');
  }
  
  // Check if user has already reviewed this booking
  const { data: existingReview, error: existingError } = await supabase
    .from('customer_reviews')
    .select('review_id')
    .eq('booking_id', booking_id)
    .eq('user_id', userId)
    .single();
    
  if (existingReview) {
    throw new Error('You have already reviewed this booking');
  }
  
  // Create the review
  const { data, error } = await supabase
    .from('customer_reviews')
    .insert({
      user_id: userId,
      booking_id,
      salon_id,
      review_text: review_text || null,
      star_rating
    })
    .select(`
      review_id,
      booking_id,
      salon_id,
      review_text,
      star_rating,
      created_at,
      updated_at,
      salon (
        salon_name,
        salon_address
      ),
      booking (
        booking_start_datetime,
        total_price
      )
    `)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const handleGetUserReviews = async (salon_id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('customer_reviews')
    .select(`
      review_id,
      review_text,
      star_rating,
      created_at,
      updated_at,
      user(
        customer(
          first_name
        )
      )    
    `, { count: 'exact' })
    .eq('salon_id', salon_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) throw new Error(error.message);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

export const handleGetReviewById = async (userId, reviewId) => {
  const { data, error } = await supabase
    .from('customer_reviews')
    .select(`
      review_id,
      booking_id,
      salon_id,
      review_text,
      star_rating,
      created_at,
      updated_at,
      salon (
        salon_name,
        salon_address
      ),
      booking (
        booking_start_datetime,
        total_price
      )
    `)
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
};

export const handleUpdateReview = async (userId, reviewId, updateData) => {
  // Only allow updating review_text and star_rating
  const allowedFields = ['review_text', 'star_rating'];
  const filteredUpdateData = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = updateData[key];
    }
  });
  
  if (Object.keys(filteredUpdateData).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  // Add updated_at timestamp
  filteredUpdateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('customer_reviews')
    .update(filteredUpdateData)
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .select(`
      review_id,
      booking_id,
      salon_id,
      review_text,
      star_rating,
      created_at,
      updated_at,
      salon (
        salon_name,
        salon_address
      ),
      booking (
        booking_start_datetime,
        total_price
      )
    `)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
};

export const handleDeleteReview = async (userId, reviewId) => {
  const { data, error } = await supabase
    .from('customer_reviews')
    .delete()
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .select('review_id')
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
};


export const handleGetSalonReviews = async (salonId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('customer_reviews')
    .select(`
      review_id,
      user_id,
      booking_id,
      review_text,
      star_rating,
      created_at,
      updated_at,
      user:user_id (
        email
      ),
      booking (
        booking_start_datetime,
        total_price
      )
    `, { count: 'exact' })
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

