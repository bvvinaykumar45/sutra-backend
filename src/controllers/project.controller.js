import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/project-member.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectMemberRoleEnum } from "../utils/constants.js";

const getProjectById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;

  if (!user.isAdmin) {
    const member = await ProjectMember.findOne({
      projectId,
      userId: user._id,
    });
    if (!member) {
      throw new ApiError(403, "You are not allowed to perform the task.");
    }
  }

  const [project] = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        as: "createdBy",
        let: {
          creatorId: "$createdBy",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$creatorId"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              email: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $lookup: {
        from: "projectmembers",
        as: "members",
        let: {
          currentProjectId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$projectId", "$$currentProjectId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
    {
      $addFields: {
        numberOfMembers: {
          $ifNull: [
            {
              $first: "$members.count",
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        members: 0,
      },
    },
  ]);

  if (!project) throw new ApiError(404, "Project does not exists!");

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project is fetched successfully."));
});

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

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const project = await Project.findById(projectId).session(session);

    if (!project) {
      throw new ApiError(404, "Project does not exists!");
    }

    await ProjectMember.deleteMany({ projectId }).session(session);
    await Project.findByIdAndDelete(projectId).session(session);
    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id: project._id },
          "Project is successfully deleted.",
        ),
      );
  } catch (error) {
    await session.abortTransaction();

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      500,
      "Error while delete project transaction.",
      [],
      error.stack,
    );
  } finally {
    session.endSession();
  }
});

export { createProject, deleteProject, getProjectById, updateProject };
