import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  updateProjectValidator,
} from "../validators/project.validator.js";
import {
  createProject,
  updateProject,
} from "../controllers/project.controller.js";
import { checkForAdmin } from "../middlewares/admin-check.middleware.js";

const router = new Router();

router.use(verifyJWT);

router
  .route("/")
  .post(checkForAdmin, createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .patch(checkForAdmin, updateProjectValidator(), validate, updateProject);

export default router;
