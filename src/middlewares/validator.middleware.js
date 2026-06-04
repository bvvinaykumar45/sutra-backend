import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const extractedErrors = errors
    .array()
    .map((err) => ({ [err.path]: err.msg }));

  console.error({
    errors: errors.array(),
  });
  throw new ApiError(422, "Invalid Request Data", extractedErrors);
};
