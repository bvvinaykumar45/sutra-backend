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

export const getProjectNotesValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("Project id is required")
      .isMongoId()
      .withMessage("Invalid projectId"),
  ];
};

export const getProjectNoteByIdValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("Project id is required")
      .isMongoId()
      .withMessage("Invalid projectId"),
    param("noteId")
      .trim()
      .notEmpty()
      .withMessage("Project Note Id is required")
      .isMongoId()
      .withMessage("Invalid project note id"),
  ];
};

export const updateProjectNoteValidator = () => {
  return [
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("Project id is required")
      .isMongoId()
      .withMessage("Invalid projectId"),
    param("noteId")
      .trim()
      .notEmpty()
      .withMessage("Project Note Id is required")
      .isMongoId()
      .withMessage("Invalid project note id"),
    body().custom((body, { req }) => {
      const allowedFields = ["title", "content"];
      const fetchedFields = Object.keys(body);

      const invalidFields = fetchedFields.filter(
        (field) => !allowedFields.includes(field),
      );
      if (invalidFields.length > 0)
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);

      if (fetchedFields.length === 0)
        throw new Error("Provide at least one field among title, content");

      return true;
    }),
    body("title").trim().optional(),
    body("content").trim().optional(),
  ];
};
