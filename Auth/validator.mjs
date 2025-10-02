import { body } from "express-validator";

export const signupValidator = [
  body("email")
    .isEmail().withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 50 }).withMessage("Password must be 8-50 characters")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character"),
  body("displayName")
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("Display name must be 2-30 characters")
    .escape(),
];

export const loginValidator = [
  body("idToken")
    .notEmpty().withMessage("idToken is required")
    .isString().withMessage("idToken must be a string")
    .trim(),
];

export const updateProfileValidator = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("Display name must be 2-30 characters")
    .escape(),
  body("password")
    .optional()
    .isLength({ min: 8, max: 50 }).withMessage("Password must be 8-50 characters")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character"),
];

export const resetPasswordValidator = [
  body("email")
    .isEmail().withMessage("Must be a valid email")
    .normalizeEmail(),
];

export const deleteAccountValidator = [
  body("confirm")
    .equals("DELETE").withMessage("You must type 'DELETE' to confirm account deletion"),
];
