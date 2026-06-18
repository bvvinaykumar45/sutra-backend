import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator } from "../validators/project.validator.js";
import { createProject } from "../controllers/project.controller.js";
import { checkForAdmin } from "../middlewares/admin-check.middleware.js";

const router = new Router();

router.use(verifyJWT);

router
  .route("/")
  .post(checkForAdmin, createProjectValidator(), validate, createProject);

export default router;
