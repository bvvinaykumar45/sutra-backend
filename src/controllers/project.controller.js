import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/project-member.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectMemberRoleEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const user = req.user;

  let projectMatch = {};

  if (!user.isAdmin) {
    const membershipDocuments = await ProjectMember.find({
      userId: user._id,
    }).select("projectId");
    const projectIds = membershipDocuments.map((doc) => doc.projectId);

    if (projectIds.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "Projects are fetched successfully."));
    }

    projectMatch._id = {
      $in: projectIds,
    };
  }

  const projects = await Project.aggregate([
    {
      $match: projectMatch,
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              _id: 1,
              userName: 1,
              fullName: 1,
              avatar: 1,
              email: 1,
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
        as: "membersStat",
        let: {
          creatorId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$projectId", "$$creatorId"],
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "projectmembers",
        let: {
          projectId: "$_id",
          currentUserId: new mongoose.Types.ObjectId(user._id),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$projectId", "$$projectId"],
                  },
                  {
                    $eq: ["$userId", "$$currentUserId"],
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              role: 1,
            },
          },
        ],
        as: "currentUserRoleStat",
      },
    },
    {
      $addFields: {
        numberOfMembers: {
          $size: "$membersStat",
        },
        role: {
          $ifNull: [
            {
              $first: "$currentUserRoleStat.role",
            },
            null,
          ],
        },
      },
    },
    {
      $project: {
        membersStat: 0,
        currentUserRoleStat: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects are fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;

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
        ],
      },
    },
    {
      $addFields: {
        numberOfMembers: {
          $size: "$members",
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

  project.role = user.role ?? null;
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

const getProjectMembers = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;

  const [aggregateResult] = await ProjectMember.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              userName: 1,
              fullName: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$user",
    },
    {
      $group: {
        _id: "$projectId",
        members: { $push: "$user" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);

  const members = aggregateResult.members;

  return res
    .status(200)
    .json(
      new ApiResponse(200, members, "Project Members fetched successfully"),
    );
});

export {
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateProject,
};
