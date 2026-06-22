import { body, param } from "express-validator";

export const userRegisterValidator = () => {
  return [
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("userName is required")
      .bail()
      .isLowercase()
      .withMessage("userName must be in lower case")
      .bail()
      .isLength({ min: 3 })
      .withMessage("userName must be atleast 3 characters long"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .bail()
      .isEmail()
      .withMessage("email is invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "password must contain atleast one lowercase, one uppercase, one number, one symbol and must be atleast 8 characters long",
      ),
    body("fullName").trim().optional(),
  ];
};

export const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .bail()
      .isEmail()
      .withMessage("email is invalid"),
    body("password").notEmpty().withMessage("password is required"),
  ];
};

export const verifyEmailValidator = () => {
  return [
    param("verificationToken")
      .trim()
      .notEmpty()
      .withMessage("verificationToken is required")
      .isHexadecimal()
      .withMessage("Token is invalid"),
  ];
};

export const forgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .bail()
      .isEmail()
      .withMessage("inavalid email id"),
  ];
};

export const resetForgotPasswordValidator = () => {
  return [
    param("resetToken")
      .trim()
      .notEmpty()
      .withMessage("resetToken is required")
      .isHexadecimal()
      .withMessage("invalid token"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "password must contain atleast one lowercase, one uppercase, one number, one symbol and must be atleast 8 characters long",
      ),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("cofirmPassword is required")
      .bail()
      .custom(
        (confirmPassword, { req }) => confirmPassword === req.body.password,
      )
      .withMessage("confirmPassword must match password"),
  ];
};

export const changePasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("oldPassword is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("newPassword is required")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "password must contain atleast one lowercase, one uppercase, one number, one symbol and must be atleast 8 characters long",
      )
      .custom((newPassword, { req }) => newPassword !== req.body.oldPassword)
      .withMessage("New password cannot be same as Old password"),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("cofirmPassword is required")
      .bail()
      .custom(
        (confirmPassword, { req }) => confirmPassword === req.body.newPassword,
      )
      .withMessage("confirmPassword must match newPassword"),
  ];
};
