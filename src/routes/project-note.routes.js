import { Router } from "express";

import { projectRoleCheck } from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import { AvailableProjectMemberRoles } from "../utils/constants.js";

import {
  createProjectNoteValidator,
  getProjectNoteByIdValidator,
  getProjectNotesValidator,
} from "../validators/project-note.validator.js";
import {
  createProjectNote,
  getProjectNoteById,
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

router
  .route("/:noteId")
  .get(
    projectRoleCheck(AvailableProjectMemberRoles),
    getProjectNoteByIdValidator(),
    validate,
    getProjectNoteById,
  );

export default router;
