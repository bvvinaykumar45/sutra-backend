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
import { taskAttachmentUpload } from "../utils/file-upload.js";

import {
  addAttachmentsValidator,
  createTaskValidator,
  deleteAttachmentsValidator,
  deleteTaskValidator,
  fetchAttachmentValidator,
  getTaskByIdValidator,
  getTasksValidator,
  updateTaskValidator,
} from "../validators/task.validator.js";

import {
  addAttachments,
  createTask,
  deleteAttachment,
  deleteTask,
  fetchAttachment,
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

router
  .route("/:taskId/attachments")
  .post(
    projectRoleCheck(AvailableProjectMemberRoles),
    addAttachmentsValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    taskAttachmentUpload.array("attachments", 3),
    addAttachments,
  );

router
  .route("/:taskId/attachments/:attachmentId")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    fetchAttachmentValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    fetchAttachment,
  )
  .delete(
    projectRoleCheck(AvailableProjectMemberRoles),
    deleteAttachmentsValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    deleteAttachment,
  );

export default router;
