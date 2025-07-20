import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import { getAllusers } from '../controllers/supperAdminController.js';
//get all users data from the database


const router = express.Router();
router.get('/all-users',requireAuth,getAllusers)
export default router;