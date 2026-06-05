import { Router } from "express";

import { userRegisterValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { login, registerUser } from "../controllers/auth.controller.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(login);

export default router;
