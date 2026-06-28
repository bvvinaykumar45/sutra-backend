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

export const getSubTasksValidator = () => {
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

export const getSubTaskByIdValidator = () => {
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
    param("subTaskId")
      .trim()
      .notEmpty()
      .withMessage("sub task id is required")
      .isMongoId()
      .withMessage("Invalid sub task id"),
  ];
};

export const updateSubTaskValidator = () => {
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
    param("subTaskId")
      .trim()
      .notEmpty()
      .withMessage("sub task id is required")
      .isMongoId()
      .withMessage("Invalid sub task id"),
    body().custom((body, { req }) => {
      const allowedFields = ["title", "description", "isCompleted"];

      const fetchedFields = Object.keys(body);
      const invalidFields = fetchedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (invalidFields.length > 0) {
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
      }

      if (fetchedFields.length === 0) {
        throw new Error(
          "Provide at least one field to update among: title, description, isCompleted",
        );
      }

      return true;
    }),
    body("title").trim().optional(),
    body("description").trim().optional(),
    body("isCompleted").optional().isBoolean().withMessage("Invalid boolean"),
  ];
};

export const deleteSubTaskValidator = () => {
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
    param("subTaskId")
      .trim()
      .notEmpty()
      .withMessage("sub task id is required")
      .isMongoId()
      .withMessage("Invalid sub task id"),
  ];
};
