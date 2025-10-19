import { body } from "express-validator";

export const searchUserValidator = [
  body("substr")
    .exists().withMessage("Search substring (substr) is required.")
    .bail()
    .isString().withMessage("Search substring must be a string.")
    .bail()
    .trim()
    .notEmpty().withMessage("Search substring cannot be empty.")
    .bail()
    .isLength({ max: 50 }).withMessage("Search substring too long (max 50 chars).")
    .bail()
    .matches(/^[a-zA-Z0-9@._\s-]+$/)
    .withMessage("Invalid characters. Use letters, numbers, spaces, or @._- only.")
];