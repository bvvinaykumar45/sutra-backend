import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/project-member.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectMemberRoleEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  const project = await Project.create({
    title,
    description,
    createdBy: new mongoose.Types.ObjectId(user._id),
  });

  await ProjectMember.create({
    projectId: project._id,
    userId: user._id,
    role: ProjectMemberRoleEnum.PROJECT_ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully."));
});
