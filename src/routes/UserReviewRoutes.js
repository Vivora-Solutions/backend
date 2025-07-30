import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getSalonReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Review management routes

// Create a review by a user
router.post('/', createReview);                       // POST {{base_url}}/api/review  -works
// Get all reviews of per salon
router.get('/', getUserReviews);                      // GET {{base_url}}/api/review -    works
// Get a specific review by ID
router.get('/:reviewId', getReviewById);              // GET {{base_url}}/api/review/:reviewId   -works
// Edit a review by a user only for that user made reviews
router.put('/:reviewId', updateReview);               // PUT {{base_url}}/api/review/:reviewId   
// Delete a review by a user only for that user made reviews
router.delete('/:reviewId', deleteReview);            // DELETE {{base_url}}/api/review/:reviewId  -works
// Get all reviews of per salon
router.get('/salon/:salonId', getSalonReviews);        //GET http://localhost:3000/api/review/salon/2da738de-ab0e-4cc5-9e5a-a4bfcbb43dc0

export default router;