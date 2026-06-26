import { body, param, query } from "express-validator";

import { AvailableTaskStatuses } from "../utils/constants.js";

export const getTasksValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("project id is required")
      .isMongoId()
      .withMessage("Invalid project id"),
  ];
};

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

export const updateTaskValidator = () => {
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
    body().custom((body) => {
      const allowedFields = ["title", "description", "assignedTo", "status"];
      const receivedFields = Object.keys(body);

      const invalidFields = receivedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (invalidFields.length > 0) {
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
      }

      if (receivedFields.length === 0) {
        throw new Error(
          "Provide at least one field to update among: title, description, status, assignedTo",
        );
      }

      return true;
    }),
    body("title").trim().optional(),
    body("description").trim().optional(),
    body("assignedTo")
      .trim()
      .optional()
      .isMongoId()
      .withMessage("Invalid User Id for assignedTo"),
    body("status")
      .trim()
      .optional()
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid Task Status"),
  ];
};

export const deleteTaskValidator = () => {
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

export const addAttachmentsValidator = () => {
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

export const deleteAttachmentsValidator = () => {
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
    param("attachmentId")
      .trim()
      .notEmpty()
      .withMessage("attachment id is required")
      .isMongoId()
      .withMessage("Invalid attachment id"),
  ];
};

export const fetchAttachmentValidator = () => {
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
    param("attachmentId")
      .trim()
      .notEmpty()
      .withMessage("attachment id is required")
      .isMongoId()
      .withMessage("Invalid attachment id"),
    query("mode")
      .trim()
      .notEmpty()
      .withMessage("mode is required, pass it as query")
      .isIn(["preview", "download"])
      .withMessage("Invalid Mode, pass either preview or download"),
  ];
};
