import { Router } from "express";

import {
  projectRoleCheck,
  taskActionPermissionCheck,
} from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  AvailableProjectMemberRoles,
  AvailableTaskUsers,
  TaskUsersEnum,
} from "../utils/constants.js";
import {
  createTaskValidator,
  deleteTaskValidator,
  getTaskByIdValidator,
  getTasksValidator,
  updateTaskValidator,
} from "../validators/task.validator.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    getTasksValidator(),
    validate,
    getTasks,
  )
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
  )
  .patch(
    projectRoleCheck(AvailableProjectMemberRoles),
    updateTaskValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    updateTask,
  )
  .delete(
    projectRoleCheck(AvailableProjectMemberRoles),
    deleteTaskValidator(),
    validate,
    taskActionPermissionCheck([TaskUsersEnum.CREATED_BY]),
    deleteTask,
  );

export default router;
