import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  getAuthenticatedUser,
  registerCustomerController,
  registerSalonController,
  completeOAuthRegistrationController,
  registerCustomerControllerGoogle,
} from "../controllers/authController.js";

import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register-customer", registerCustomerController);
router.post("/register-customer-google", registerCustomerControllerGoogle);
router.post("/register-salon", registerSalonController);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getAuthenticatedUser);
router.post("/refresh-token", refreshToken);
// ...existing code...
router.post(
  "/complete-oauth-registration",
  completeOAuthRegistrationController
);

export default router;
