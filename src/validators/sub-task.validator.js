import { body, param } from "express-validator";

export const createSubTaskValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("project id is required")
      .isMongoId()
      .withMessage("Invalid project id"),
    param("taskId")
      .trim()
      .notEmpty()
      .withMessage("task id is required")
      .isMongoId()
      .withMessage("Invalid task id"),
    body("title").trim().notEmpty().withMessage("title is required"),
    body("description").trim().optional(),
  ];
};
