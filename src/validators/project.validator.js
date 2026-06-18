import { body } from "express-validator";

export const createProjectValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("description").trim().optional(),
  ];
};
