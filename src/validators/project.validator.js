import { body, param } from "express-validator";

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
