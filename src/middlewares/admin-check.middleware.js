import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const checkForAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new ApiError(403, "You are not allowed to perform this action");
  }
  next();
});
