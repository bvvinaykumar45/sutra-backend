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
import { createSubTaskValidator } from "../validators/sub-task.validator.js";
import { createSubTask } from "../controllers/sub-task.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    projectRoleCheck(AvailableProjectMemberRoles),
    createSubTaskValidator(),
    validate,
    taskActionPermissionCheck(AvailableTaskUsers),
    createSubTask,
  );

export default router;
