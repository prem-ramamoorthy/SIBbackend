import { body, param } from 'express-validator';

export const createVerticalValidation = [
  body('vertical_name')
    .isString()
    .withMessage('vertical_name must be a string')
    .isLength({ max: 100 })
    .withMessage('vertical_name max length is 100')
    .notEmpty()
    .withMessage('vertical_name is required'),
  body('vertical_code')
    .isString()
    .withMessage('vertical_code must be a string')
    .isLength({ max: 20 })
    .withMessage('vertical_code max length is 20')
    .notEmpty()
    .withMessage('vertical_code is required'),
  body('description')
    .isString()
    .withMessage('description must be a string')
    .notEmpty()
    .withMessage('description is required'),
  body('created_at')
    .isISO8601()
    .toDate()
    .withMessage('created_at must be a valid date')
    .notEmpty()
    .withMessage('created_at is required')
];

export const updateVerticalValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid vertical ID'),
  body('vertical_name')
    .optional()
    .isString()
    .withMessage('vertical_name must be a string')
    .isLength({ max: 100 })
    .withMessage('vertical_name max length is 100'),
  body('vertical_code')
    .optional()
    .isString()
    .withMessage('vertical_code must be a string')
    .isLength({ max: 20 })
    .withMessage('vertical_code max length is 20'),
  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string'),
  body('created_at')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('created_at must be a valid date')
];

export const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid vertical ID')
];