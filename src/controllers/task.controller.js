import mongoose from "mongoose";
import { ProjectMember } from "../models/project-member.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists");

  const tasks = await Task.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $addFields: {
        userIdsToLookup: {
          $filter: {
            input: ["$createdBy", "$assignedBy", "$assignedTo"],
            as: "userIds",
            cond: { $ne: ["$$userIds", null] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          userIds: "$userIdsToLookup",
        },
        as: "lookedUpUsers",
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$userIds"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: {
            $filter: {
              input: "$lookedUpUsers",
              as: "user",
              cond: { $eq: ["$$user._id", "$createdBy"] },
            },
          },
        },
        assignedBy: {
          $ifNull: [
            {
              $first: {
                $filter: {
                  input: "$lookedUpUsers",
                  as: "user",
                  cond: { $eq: ["$$user._id", "$assignedBy"] },
                },
              },
            },
            null,
          ],
        },
        assignedTo: {
          $ifNull: [
            {
              $first: {
                $filter: {
                  input: "$lookedUpUsers",
                  as: "user",
                  cond: { $eq: ["$$user._id", "$assignedTo"] },
                },
              },
            },
            null,
          ],
        },
      },
    },
    {
      $project: {
        projectId: 0,
        userIdsToLookup: 0,
        lookedUpUsers: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks are fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists");

  const [task] = await Task.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $addFields: {
        userIdsToLookup: {
          $filter: {
            input: ["$createdBy", "$assignedBy", "$assignedTo"],
            as: "userId",
            cond: { $ne: ["$$userId", null] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          userIds: "$userIdsToLookup",
        },
        as: "lookedUpUsers",
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$userIds"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: {
            $filter: {
              input: "$lookedUpUsers",
              as: "user",
              cond: { $eq: ["$$user._id", "$createdBy"] },
            },
          },
        },
        assignedBy: {
          $ifNull: [
            {
              $first: {
                $filter: {
                  input: "$lookedUpUsers",
                  as: "user",
                  cond: { $eq: ["$$user._id", "$assignedBy"] },
                },
              },
            },
            null,
          ],
        },
        assignedTo: {
          $ifNull: [
            {
              $first: {
                $filter: {
                  input: "$lookedUpUsers",
                  as: "user",
                  cond: { $eq: ["$$user._id", "$assignedTo"] },
                },
              },
            },
            null,
          ],
        },
      },
    },
    {
      $project: {
        projectId: 0,
        userIdsToLookup: 0,
        lookedUpUsers: 0,
      },
    },
  ]);

  if (task.length === 0) throw new ApiError(404, "Task does not exists");

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

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

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists");

  const task = await Task.findByIdAndDelete(taskId, {
    returnDocument: "after",
  });
  if (!task) throw new ApiError(404, "Task does not exists");

  return res
    .status(200)
    .json(new ApiResponse(200, { id: task._id }, "Task deleted successfully"));
});

export { createTask, deleteTask, getTaskById, getTasks };
