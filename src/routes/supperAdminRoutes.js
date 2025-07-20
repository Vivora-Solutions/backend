import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import { getAllusers } from '../controllers/supperAdminController.js';
import { requireSupperAdmin } from "../middlewares/requireSupperAdmin.js";
//get all users data from the database


const router = express.Router();
router.get('/all-users',requireAuth,requireSupperAdmin,getAllusers)
export default router;