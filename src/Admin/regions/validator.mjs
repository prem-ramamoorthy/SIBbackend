import { body, param } from 'express-validator';

export const regionValidators = {
  
  create: [
    body('region_name')
      .isString().withMessage('region_name must be a string')
      .notEmpty().withMessage('region_name is required')
      .isLength({ max: 100 }).withMessage('region_name max length is 100'),
    body('region_code')
      .isString().withMessage('region_code must be a string')
      .notEmpty().withMessage('region_code is required')
      .isLength({ max: 10 }).withMessage('region_code max length is 10'),
    body('country')
      .isString().withMessage('country must be a string')
      .notEmpty().withMessage('country is required')
      .isLength({ max: 50 }).withMessage('country max length is 50'),
    body('created_at')
      .optional()
      .isISO8601().withMessage('created_at must be a valid ISO8601 date'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid region ID'),
    body('region_name')
      .optional()
      .isString().withMessage('region_name must be a string')
      .isLength({ max: 100 }).withMessage('region_name max length is 100'),
    body('region_code')
      .optional()
      .isString().withMessage('region_code must be a string')
      .isLength({ max: 10 }).withMessage('region_code max length is 10'),
    body('country')
      .optional()
      .isString().withMessage('country must be a string')
      .isLength({ max: 50 }).withMessage('country max length is 50'),
    body('created_at')
      .optional()
      .isISO8601().withMessage('created_at must be a valid ISO8601 date'),
  ],

  idParam: [
    param('id')
      .isMongoId().withMessage('Invalid region ID'),
  ],
};
