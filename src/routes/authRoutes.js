import express from 'express';
import {
    loginUser,
    logoutUser,
    refreshToken,
    getAuthenticatedUser, registerCustomerController, registerSalonController
} from '../controllers/authController.js';

import {requireAuth} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register-customer', registerCustomerController);
router.post('/register-salon', registerSalonController);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getAuthenticatedUser);
router.post('/refresh-token', refreshToken);



export default router;
