import { Router } from "express";

import { projectRoleCheck } from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import { AvailableProjectMemberRoles } from "../utils/constants.js";

import {
  createProjectNoteValidator,
  getProjectNotesValidator,
} from "../validators/project-note.validator.js";
import {
  createProjectNote,
  getProjectNotes,
} from "../controllers/project-note.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    getProjectNotesValidator(),
    validate,
    getProjectNotes,
  )
  .post(
    projectRoleCheck(AvailableProjectMemberRoles),
    createProjectNoteValidator(),
    validate,
    createProjectNote,
  );

export default router;
