import { Router } from "express";

import {
  forgotPasswordValidator,
  resetForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  verifyEmailValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = Router();

// unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/reset-password/:resetToken")
  .post(resetForgotPasswordValidator(), validate, resetForgotPassword);
router
  .route("/forgot-password")
  .post(forgotPasswordValidator(), validate, forgotPassword);
router
  .route("/verify-email/:verificationToken")
  .post(verifyEmailValidator(), validate, verifyEmail);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

export default router;
