import express from 'express';
import { addPhoneNumber, getUserProfile, updateUserProfile } from '../controllers/profileController.js';
import {requireAuth} from "../middlewares/authMiddleware.js";


const router = express.Router();

// GET user profile by user_id
router.get('/', requireAuth, getUserProfile);

// PUT update user profile by user_id
router.put('/', requireAuth, updateUserProfile);

// POST add phone number to user profile
router.post('/add-phone', requireAuth, addPhoneNumber);

export default router;
