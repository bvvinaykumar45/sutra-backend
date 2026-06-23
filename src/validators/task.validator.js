import { body, param } from "express-validator";

export const getTaskByIdValidator = () => {
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
  ];
};

export const createTaskValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("project id is required")
      .isMongoId()
      .withMessage("Invalid project id"),
    body().custom((body) => {
      const allowedFields = ["title", "description", "assignedTo"];
      const bodyFields = Object.keys(body);
      const isValid = bodyFields.every((field) =>
        allowedFields.includes(field),
      );

      if (!isValid)
        throw new Error("Allowed fields are title, description, assignedTo");
      return true;
    }),
    body("title").trim().notEmpty().withMessage("title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("description is required"),
    body("assignedTo")
      .trim()
      .optional()
      .isMongoId()
      .withMessage("Invalid User Id for assignedTo"),
  ];
};
