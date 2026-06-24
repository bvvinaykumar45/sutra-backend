import { ProjectMember } from "../models/project-member.model.js";
import { Task } from "../models/task.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

import { ProjectMemberRoleEnum } from "../utils/constants.js";

export const checkForAdmin = asyncHandler((req, res, next) => {
  if (!req.user.isAdmin) {
    throw new ApiError(403, "You are not allowed to perform this action");
  }
  next();
});

export const projectRoleCheck = (projectRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (req.user.isAdmin) return next();

    const { projectId } = req.params;
    const user = req.user;

    const memberShip = await ProjectMember.findOne({
      projectId,
      userId: user._id,
    });

    if (!memberShip || !projectRoles.includes(memberShip.role)) {
      throw new ApiError(403, "You are not allowed to perform the action");
    }

    req.projectRole = memberShip.role;
    next();
  });
};

export const taskActionPermissionCheck = (taskOwnerShips) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    const { taskId } = req.params;

    if (user.isAdmin || user.role === ProjectMemberRoleEnum.PROJECT_ADMIN)
      return next();

    const feildsToFetch = taskOwnerShips.join(" ");
    const task = await Task.findById(taskId).select(feildsToFetch);

    if (task) {
      const keys = Object.keys(task);
      const currentUserId = user._id;

      const isAllowed = keys.some((key) => task[key] === currentUserId);

      if (!isAllowed)
        throw new ApiError(403, "You are not allowed to perform the action");

      next();
    } else {
      throw new ApiError(404, "Task does not exists");
    }
  });
};
