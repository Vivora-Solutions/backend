import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  getReviews,
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getSalonReviews
} from "../controllers/reviewController.js";

const router = express.Router();



// Review management routes

router.get('/review-for-home-page', getReviews);
// Create a review by a user
router.post('/', requireAuth, createReview);                       // POST {{base_url}}/api/review  -works
// Get all reviews of per salon
router.get('/', requireAuth, getUserReviews);                      // GET {{base_url}}/api/review -    works
// Get a specific review by ID
router.get('/:reviewId',requireAuth, getReviewById);              // GET {{base_url}}/api/review/:reviewId   -works
// Edit a review by a user only for that user made reviews
router.put('/:reviewId',requireAuth,  updateReview);               // PUT {{base_url}}/api/review/:reviewId
// Delete a review by a user only for that user made reviews
router.delete('/:reviewId',requireAuth, deleteReview);            // DELETE {{base_url}}/api/review/:reviewId  -works
// Get all reviews of per salon
router.get('/salon/:salonId', requireAuth,getSalonReviews);        //GET http://localhost:3000/api/review/salon/2da738de-ab0e-4cc5-9e5a-a4bfcbb43dc0

export default router;