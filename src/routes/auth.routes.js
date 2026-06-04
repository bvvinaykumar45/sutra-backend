import { Router } from "express";

import { userRegisterValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { registerUser } from "../controllers/auth.controller.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);

export default router;
