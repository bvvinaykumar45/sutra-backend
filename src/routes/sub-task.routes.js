import { Router } from "express";

import {
  projectRoleCheck,
  taskActionPermissionCheck,
} from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import {
  AvailableProjectMemberRoles,
  AvailableTaskUsers,
} from "../utils/constants.js";

import {
  createSubTaskValidator,
  getSubTaskByIdValidator,
  getSubTasksValidator,
} from "../validators/sub-task.validator.js";

import {
  createSubTask,
  getSubTaskById,
  getSubTasks,
} from "../controllers/sub-task.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    getSubTasksValidator(),
    validate,
    getSubTasks,
  )
  .post(
    projectRoleCheck(AvailableProjectMemberRoles),
    createSubTaskValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    createSubTask,
  );

router
  .route("/:subTaskId")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    getSubTaskByIdValidator(),
    validate,
    getSubTaskById,
  );

export default router;
