import { ProjectMember } from "../models/project-member.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo } = req.body;
  const user = req.user;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists");

  const taskPayload = {
    title,
    description,
    projectId,
    createdBy: user._id,
  };

  if (assignedTo) {
    const assignedMember = await ProjectMember.findOne({
      projectId,
      userId: assignedTo,
    }).select("_id");
    if (!assignedMember)
      throw new ApiError(400, "User is not project member to assign task");

    taskPayload.assignedBy = user._id;
    taskPayload.assignedTo = assignedTo;
  }

  const task = await Task.create(taskPayload);

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

export { createTask };
