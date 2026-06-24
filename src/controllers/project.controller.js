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

  project.role = req.projectRole ?? null;
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
      $addFields: {
        "user.role": "$role",
      },
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

const addMembersToProject = asyncHandler(async (req, res) => {
  const { members } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists!");

  const userIds = members.map((member) => member.userId);

  const users = await User.find({
    _id: {
      $in: userIds,
    },
  }).select("_id");

  if (users.length !== userIds.length)
    throw new ApiError(404, "One or more users does not exists!");

  const existingMembers = await ProjectMember.find({
    projectId,
    userId: {
      $in: userIds,
    },
  }).select("userId");

  if (existingMembers.length > 0) {
    const existingMemberIds = existingMembers.map((member) =>
      member.userId.toString(),
    );
    throw new ApiError(
      409,
      "One or more users are already a member",
      existingMemberIds,
    );
  }

  const membersToCreate = members.map((member) => ({
    projectId,
    userId: member.userId,
    role: member.role,
  }));

  const createdMembers = await ProjectMember.insertMany(membersToCreate);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { members: createdMembers },
        "Members added to project successfully",
      ),
    );
});

const updateProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists!");

  const user = await User.findById(userId).select("_id");
  if (!user) throw new ApiError(404, "User does not exists!");

  const updatedMember = await ProjectMember.findOneAndUpdate(
    {
      projectId,
      userId,
    },
    {
      role,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedMember)
    throw new ApiError(404, "Project member does not exists!");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully updated project member"));
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists!");

  const user = await User.findById(userId).select("_id");
  if (!user) throw new ApiError(404, "User does not exists!");

  const deletedMember = await ProjectMember.findOneAndDelete(
    {
      projectId,
      userId,
    },
    {
      returnDocument: "after",
    },
  );

  if (!deletedMember)
    throw new ApiError(404, "Project Member does not exists!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { _id: deletedMember._id },
        "Project Member deleted successfully",
      ),
    );
});

export {
  addMembersToProject,
  createProject,
  deleteProject,
  deleteProjectMember,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateProject,
  updateProjectMember,
};
