import {
  handleGetReviews,
  handleCreateReview,
  handleGetUserReviews,
  handleGetReviewById,
  handleUpdateReview,
  handleDeleteReview,
  handleGetSalonReviews
} from '../services/reviewServices.js'


//getReviews
export const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await handleGetReviews( parseInt(page), parseInt(limit));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createReview = async (req, res) => {
  try {
    const user_id = req.userId;
    const reviewData = req.body;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    // Validate required fields
    const { booking_id, salon_id, star_rating } = reviewData;
    
    if (!booking_id || !salon_id || star_rating === undefined) {
      return res.status(400).json({ 
        error: 'booking_id, salon_id, and star_rating are required' 
      });
    }
    
    if (star_rating < 0 || star_rating > 5) {
      return res.status(400).json({ error: 'star_rating must be between 0 and 5' });
    }
    
    const result = await handleCreateReview(user_id, reviewData);
    res.status(201).json({ message: 'Review created successfully', data: result });
  } catch (err) {
    if (err.message.includes('already reviewed') || err.message.includes('not found')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const user_id = req.userId;
    const { page = 1, limit = 10 } = req.query;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    const result = await handleGetUserReviews(user_id, parseInt(page), parseInt(limit));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const user_id = req.userId;
    const { reviewId } = req.params;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!reviewId) return res.status(400).json({ error: 'Review ID is required' });
    
    const result = await handleGetReviewById(user_id, reviewId);
    if (!result) return res.status(404).json({ error: 'Review not found' });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const user_id = req.userId;
    const { reviewId } = req.params;
    const updateData = req.body;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!reviewId) return res.status(400).json({ error: 'Review ID is required' });
    
    // Validate star_rating if provided
    if (updateData.star_rating !== undefined && (updateData.star_rating < 0 || updateData.star_rating > 5)) {
      return res.status(400).json({ error: 'star_rating must be between 0 and 5' });
    }
    
    const result = await handleUpdateReview(user_id, reviewId, updateData);
    if (!result) return res.status(404).json({ error: 'Review not found or cannot be updated' });
    
    res.status(200).json({ message: 'Review updated successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const user_id = req.userId;
    const { reviewId } = req.params;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    if (!reviewId) return res.status(400).json({ error: 'Review ID is required' });
    
    const result = await handleDeleteReview(user_id, reviewId);
    if (!result) return res.status(404).json({ error: 'Review not found or cannot be deleted' });
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalonReviews = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!salonId) {
      return res.status(400).json({ error: 'Salon ID is required' });
    }

    const result = await handleGetSalonReviews(salonId, parseInt(page), parseInt(limit));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
