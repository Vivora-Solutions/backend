import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  getUserEmail,
  getUserDetails,
  updateUserDetails,
  updateUserPassword
} from "../controllers/userController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// User profile routes
router.get('/email', getUserEmail);                    // GET {{base_url}}/api/user/email -works
router.get('/details', getUserDetails);               // GET {{base_url}}/api/user/details - works 
router.put('/details', updateUserDetails);            // PUT {{base_url}}/api/user/details -works
router.put('/password', updateUserPassword);          // PUT {{base_url}}/api/user/password 



export default router;