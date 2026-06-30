import { Router } from "express";

import {
  projectNoteActionPermissionCheck,
  projectRoleCheck,
} from "../middlewares/role-check.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import { AvailableProjectMemberRoles } from "../utils/constants.js";

import {
  createProjectNoteValidator,
  getProjectNoteByIdValidator,
  getProjectNotesValidator,
  updateProjectNoteValidator,
} from "../validators/project-note.validator.js";
import {
  createProjectNote,
  getProjectNoteById,
  getProjectNotes,
  updateProjectNote,
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
  )
  .patch(
    projectRoleCheck(AvailableProjectMemberRoles),
    updateProjectNoteValidator(),
    validate,
    projectNoteActionPermissionCheck,
    updateProjectNote,
  );

export default router;
