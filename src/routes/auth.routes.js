import { Router } from "express";

import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  login,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
