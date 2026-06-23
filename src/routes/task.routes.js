import { Router } from "express";

import { projectRoleCheck } from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { AvailableProjectMemberRoles } from "../utils/constants.js";
import {
  createTaskValidator,
  getTaskByIdValidator,
} from "../validators/task.validator.js";
import { createTask, getTaskById } from "../controllers/task.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    projectRoleCheck(AvailableProjectMemberRoles),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route("/:taskId")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    getTaskByIdValidator(),
    validate,
    getTaskById,
  );

export default router;
