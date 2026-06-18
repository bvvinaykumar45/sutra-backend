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

const updateProject = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  const { title, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      title,
      description,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!project) {
    throw new ApiError(404, "Project does not exists!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: project._id },
        "Project is successfully updated.",
      ),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project does not exists!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: project._id },
        "Project is successfully deleted.",
      ),
    );
});

export { createProject, deleteProject, updateProject };
