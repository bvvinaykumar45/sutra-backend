import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, { message: "Server is running", status: "pass" }),
    );
});

export { healthCheck };
