import mongoose from "mongoose";
import fs from "node:fs";
2;

import { ProjectMember } from "../models/project-member.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectMemberRoleEnum } from "../utils/constants.js";
import path from "node:path";

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
            input: ["$createdBy", "$assignedTo"],
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
            input: ["$createdBy", "$assignedTo"],
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

  if (!task) throw new ApiError(404, "Task does not exists");

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

    taskPayload.assignedTo = assignedTo;
  }

  const task = await Task.create(taskPayload);

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId, taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  const updatePayload = {};
  if (title !== undefined) updatePayload.title = title;
  if (description !== undefined) updatePayload.description = description;
  if (status !== undefined) updatePayload.status = status;

  if (assignedTo !== undefined) {
    const isAllowed =
      user.isAdmin ||
      req.projectRole === ProjectMemberRoleEnum.PROJECT_ADMIN ||
      String(req.currentTask?.createdBy) === String(user._id);

    if (!isAllowed) {
      throw new ApiError(403, "You are not allowed to reassign this task");
    }

    const assignedMember = await ProjectMember.findOne({
      projectId,
      userId: assignedTo,
    }).select("_id");
    if (!assignedMember)
      throw new ApiError(400, "User is not project member to assign task");

    updatePayload.assignedTo = assignedTo;
  }

  const updatedTask = await Task.findOneAndUpdate(
    {
      projectId,
      _id: taskId,
    },
    updatePayload,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedTask) throw new ApiError(404, "Task does not exists");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task is updated successfully"));
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

const addAttachments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one file");
  }

  const { taskId, projectId } = req.params;
  const user = req.user;

  const task = await Task.findOne({
    _id: taskId,
    projectId,
  });
  if (!task) {
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.rmSync(file.path);
      }
    });
    throw new ApiError(404, "Task does not exists");
  }

  const attachments = req.files.map((file) => ({
    url: `/public/uploads/tasks/${file.filename}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: user._id,
  }));

  try {
    task.attachments.push(...attachments);
    await task.save();
  } catch (error) {
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.rmSync(file.path);
      }
    });
    throw error;
  }

  res
    .status(200)
    .json(new ApiResponse(200, { attachments }, "Files uploaded successfully"));
});

const deleteAttachment = asyncHandler(async (req, res) => {
  const { taskId, projectId, attachmentId } = req.params;
  const user = req.user;

  const task = await Task.findOne({
    _id: taskId,
    projectId,
    "attachments._id": attachmentId,
  });
  if (!task) throw new ApiError(404, "Task does not exists");

  const attachmentDetails = task.attachments.id(attachmentId);
  if (!attachmentDetails) {
    throw new ApiError(404, "Attachment does not exist");
  }

  const filePath = path.join(
    "public",
    attachmentDetails.url.replace("/public/", ""),
  );

  task.attachments.pull(attachmentId);
  await task.save();

  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { _id: attachmentId },
        "Attachment deleted successfully",
      ),
    );
});

export {
  addAttachments,
  createTask,
  deleteAttachment,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
};
