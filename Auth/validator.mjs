import { body } from "express-validator";
import { checkSchema } from "express-validator";

export const signupValidator = checkSchema({
  username: {
    in: ['body'],
    isString: { errorMessage: 'username must be a string' },
    notEmpty: { errorMessage: 'username is required' },
    isLength: { options: { max: 50 }, errorMessage: 'username max length is 50' }
  },
  email: {
    in: ['body'],
    isString: { errorMessage: 'email must be a string' },
    notEmpty: { errorMessage: 'email is required' },
    isEmail: { errorMessage: 'email must be valid' },
    isLength: { options: { max: 100 }, errorMessage: 'email max length is 100' },
  },
  phone_number: {
    in: ['body'],
    isString: { errorMessage: 'phone_number must be a string' },
    notEmpty: { errorMessage: 'phone_number is required' },
    matches: {
      options: [/^\+?[0-9\s\-()]{7,20}$/],
      errorMessage: 'phone_number must be a valid international format (+, digits, spaces, parentheses, hyphens allowed, 7-20 characters)'
    },
    isLength: { options: { max: 20 }, errorMessage: 'phone_number max length is 20' }
  },
  status: {
    in: ['body'],
    isBoolean: { errorMessage: 'status must be boolean' },
    toBoolean: true
  },
  date_joined: {
    in: ['body'],
    optional: true,
    isISO8601: { errorMessage: 'date_joined must be a valid yyyy-mm-dd date' }
  },
  password: {
    in: ['body'],
    isLength: {
      options: { min: 8, max: 50 },
      errorMessage: "Password must be 8-50 characters",
    },
    custom: {
      options: (value) => {
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasDigit = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);
        return hasLower && hasUpper && hasDigit && hasSpecial;
      },
      errorMessage: "Password must contain lowercase, uppercase, number and special char"
    }
  }
});


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

export const updatePasswordValidator = [
  body("email")
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail(),
  body("oldPassword")
    .isLength({ min: 8 }).withMessage("Old password must be at least 8 characters"),
  body("newPassword")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("New password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("New password must contain at least one lowercase letter")
    .matches(/\d/).withMessage("New password must contain at least one digit")
    .matches(/[@$!%*?&#]/).withMessage("New password must contain at least one special character"),
  body("confirmNewPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password");
      }
      return true;
    }),
];