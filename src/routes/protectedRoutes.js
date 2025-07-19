// src/routes/protectedRoutes.js
import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({
    message: 'You are authenticated',
    user: req.user,
  });
});

export default router;
