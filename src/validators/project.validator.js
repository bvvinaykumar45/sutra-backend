import { body, param } from "express-validator";
import { AvailableProjectMemberRoles } from "../utils/constants.js";

export const getProjectByIdValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("projectId is required")
      .isMongoId()
      .withMessage("Invalid project id"),
  ];
};

export const createProjectValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("description").trim().optional(),
  ];
};

export const updateProjectValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("Project Id is required")
      .isMongoId()
      .withMessage("Invalid Project Id"),

    body().custom((value) => {
      const allowedFields = ["title", "description"];
      const receivedFields = Object.keys(value);

      const invalidFields = receivedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (invalidFields.length > 0) {
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
      }

      if (receivedFields.length === 0) {
        throw new Error(
          "Provide at least one field to update: title or description",
        );
      }

      return true;
    }),

    body("title")
      .optional()
      .isString()
      .withMessage("Project title must be a string")
      .trim()
      .notEmpty()
      .withMessage("Project title cannot be empty"),

    body("description")
      .optional()
      .isString()
      .withMessage("Project description must be a string")
      .trim(),
  ];
};

export const deleteProjectValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("projectId is required")
      .isMongoId()
      .withMessage("Invalid project id"),
  ];
};

export const addMembersToProjectValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("project id is required")
      .isMongoId()
      .withMessage("Invalid project id"),
    body("members")
      .exists({ values: "falsy" })
      .withMessage("members array is required")
      .isArray({ min: 1 })
      .withMessage("members must be a non-empty array"),
    body("members.*.userId")
      .trim()
      .notEmpty()
      .withMessage("userId is required")
      .isMongoId()
      .withMessage("Invalid user id"),
    body("members.*.role")
      .trim()
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableProjectMemberRoles)
      .withMessage("Invalid role"),
  ];
};

export const updateMemberValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("project id is required")
      .isMongoId()
      .withMessage("Invalid project id"),
    param("userId")
      .trim()
      .notEmpty()
      .withMessage("userId is required")
      .isMongoId()
      .withMessage("Invalid user id"),
    body("role")
      .trim()
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableProjectMemberRoles)
      .withMessage("Invalid role"),
  ];
};
