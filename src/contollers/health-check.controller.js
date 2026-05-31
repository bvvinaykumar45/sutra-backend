import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const healthCheck = (req, res) => {
  try {
    res
      .status(200)
      .json(
        new ApiResponse(200, { message: "Server is running", status: "pass" }),
      );
  } catch (error) {
    throw new ApiError(500, error.message, [], error.stack);
  }
};

export { healthCheck };
