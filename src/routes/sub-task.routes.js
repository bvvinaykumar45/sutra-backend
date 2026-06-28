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
  deleteSubTaskValidator,
  getSubTaskByIdValidator,
  getSubTasksValidator,
  updateSubTaskValidator,
} from "../validators/sub-task.validator.js";

import {
  createSubTask,
  deleteSubTask,
  getSubTaskById,
  getSubTasks,
  updateSubTask,
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
  )
  .patch(
    projectRoleCheck(AvailableProjectMemberRoles),
    updateSubTaskValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    updateSubTask,
  )
  .delete(
    projectRoleCheck(AvailableProjectMemberRoles),
    deleteSubTaskValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    deleteSubTask,
  );

export default router;
