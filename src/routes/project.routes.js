import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  deleteProjectValidator,
  getProjectByIdValidator,
  updateProjectValidator,
} from "../validators/project.validator.js";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";
import {
  checkForAdmin,
  projectRoleCheck,
} from "../middlewares/role-check.middleware.js";
import { AvailableProjectMemberRoles } from "../utils/constants.js";

const router = new Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(checkForAdmin, createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(
    getProjectByIdValidator(),
    validate,
    projectRoleCheck(AvailableProjectMemberRoles),
    getProjectById,
  )
  .patch(checkForAdmin, updateProjectValidator(), validate, updateProject)
  .delete(checkForAdmin, deleteProjectValidator(), validate, deleteProject);

router
  .route("/:projectId/members")
  .get(projectRoleCheck(AvailableProjectMemberRoles), getProjectMembers);

export default router;
