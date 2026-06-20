import { ProjectMember } from "../models/project-member.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

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
      throw new ApiError(403, "You are not allowed to perform the task");
    }

    req.user.role = memberShip.role;
    next();
  });
};
