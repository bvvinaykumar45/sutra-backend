import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  deleteProjectValidator,
  updateProjectValidator,
} from "../validators/project.validator.js";
import {
  createProject,
  deleteProject,
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
  .patch(checkForAdmin, updateProjectValidator(), validate, updateProject)
  .delete(checkForAdmin, deleteProjectValidator(), validate, deleteProject);

export default router;
