import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profileController.js';
import {requireAuth} from "../middlewares/authMiddleware.js";


const router = express.Router();

// GET user profile by user_id
router.get('/', requireAuth, getUserProfile);

// PUT update user profile by user_id
router.put('/', requireAuth, updateUserProfile);

export default router;
