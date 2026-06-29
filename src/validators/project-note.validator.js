import { body, param } from "express-validator";

export const createProjectNoteValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("project id is required")
      .isMongoId()
      .withMessage("Invalid project id"),
    body("title").trim().notEmpty().withMessage("title is required"),
    body("content").trim().notEmpty().withMessage("Content can not be empty"),
  ];
};
