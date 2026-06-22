import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import {
  checkForAdmin,
  projectRoleCheck,
} from "../middlewares/role-check.middleware.js";

import {
  addMembersToProjectValidator,
  createProjectValidator,
  deleteProjectValidator,
  getProjectByIdValidator,
  updateMemberValidator,
  updateProjectValidator,
} from "../validators/project.validator.js";

import {
  addMembersToProject,
  createProject,
  deleteProject,
  deleteProjectMember,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateProject,
  updateProjectMember,
} from "../controllers/project.controller.js";

import {
  AvailableProjectMemberRoles,
  ProjectMemberRoleEnum,
} from "../utils/constants.js";

import taskRouter from "./task.routes.js";

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
  .get(projectRoleCheck(AvailableProjectMemberRoles), getProjectMembers)
  .post(
    projectRoleCheck([ProjectMemberRoleEnum.PROJECT_ADMIN]),
    addMembersToProjectValidator(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .patch(
    projectRoleCheck([ProjectMemberRoleEnum.PROJECT_ADMIN]),
    updateMemberValidator(),
    validate,
    updateProjectMember,
  )
  .delete(
    projectRoleCheck([ProjectMemberRoleEnum.PROJECT_ADMIN]),
    deleteProjectValidator(),
    validate,
    deleteProjectMember,
  );

router.use("/:projectId/tasks", taskRouter);

export default router;
