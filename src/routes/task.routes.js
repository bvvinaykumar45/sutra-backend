import { Router } from "express";

import { projectRoleCheck } from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { AvailableProjectMemberRoles } from "../utils/constants.js";
import { createTaskValidator } from "../validators/task.validator.js";
import { createTask } from "../controllers/task.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    projectRoleCheck(AvailableProjectMemberRoles),
    createTaskValidator(),
    validate,
    createTask,
  );

export default router;
