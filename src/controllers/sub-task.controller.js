import { Task } from "../models/task.model.js";
import { SubTask } from "../models/sub-task.model.js";

import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getSubTasks = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    projectId,
  }).select("_id");

  if (!task) {
    throw new ApiError(404, "Task does not exists");
  }

  const subTasks = await SubTask.find({
    taskId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, subTasks, "Sub Tasks fetched successfully."));
});

const getSubTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId, subTaskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    projectId,
  }).select("_id");

  if (!task) {
    throw new ApiError(404, "Task does not exists");
  }

  const subTask = await SubTask.findOne({
    _id: subTaskId,
    taskId,
  });

  if (!subTask) throw new ApiError(404, "Sub Task does not exists!");

  return res
    .status(200)
    .json(new ApiResponse(200, subTask, "Sub Task fetched successfully."));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { taskId, projectId } = req.params;
  const user = req.user;

  const task = await Task.findOne({
    _id: taskId,
    projectId,
  }).select("_id");

  if (!task) {
    throw new ApiError(404, "Task does not exists");
  }

  const subTaskPayload = {
    taskId,
    createdBy: user._id,
  };

  if (title !== undefined) subTaskPayload.title = title;
  if (description !== undefined) subTaskPayload.description = description;

  const subTask = await SubTask.create(subTaskPayload);

  return res
    .status(201)
    .json(new ApiResponse(201, subTask, "Sub Task created successfully."));
});

export { createSubTask, getSubTaskById, getSubTasks };
