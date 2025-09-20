import express from "express";
import {
  handleLoginController,
  logoutUser,
  refreshToken,
  getAuthenticatedUser,
  registerCustomerController,
  registerSalonController,
  // completeOAuthRegistrationController,
  registerCustomerControllerGoogle,
  googleOAuthLoginController,
  updatePhoneController,
  getCustomerProfileController

} from "../controllers/authController.js";

import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register-customer", registerCustomerController);
router.post("/register-customer-google", registerCustomerControllerGoogle);
router.post("/register-salon", registerSalonController);
router.post("/login", handleLoginController);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getAuthenticatedUser);
router.post("/refresh-token", refreshToken);
router.post("/google-oauth-login", googleOAuthLoginController);
router.put("/update-phone", requireAuth, updatePhoneController);
router.get("/customer-profile", requireAuth, getCustomerProfileController);
// ...existing code...
// router.post(
//   "/complete-oauth-registration",
//   completeOAuthRegistrationController
// );

export default router;
