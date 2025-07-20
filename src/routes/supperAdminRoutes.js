import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();
router.get('/')