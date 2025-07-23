import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview
} from "../controllers/ reviewController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Review management routes
router.post('/', createReview);                       // POST {{base_url}}/api/review  -works
router.get('/', getUserReviews);                      // GET {{base_url}}/api/review -    works
router.get('/:reviewId', getReviewById);              // GET {{base_url}}/api/review/:reviewId   -works
router.put('/:reviewId', updateReview);               // PUT {{base_url}}/api/review/:reviewId   
router.delete('/:reviewId', deleteReview);            // DELETE {{base_url}}/api/review/:reviewId  -works

export default router;