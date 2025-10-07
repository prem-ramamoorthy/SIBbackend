import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid performance id')
];

export const createPerformanceValidation = [
  body('username').isString().notEmpty(),
  body('chapter_name').isString().notEmpty(),
  body('period_year').isInt({ min: 1900 }).notEmpty(),
  body('period_6month').isInt({ min: 1, max: 2 }).notEmpty(),
  body('period_month').isInt({ min: 1, max: 12 }).notEmpty(),
  body('referrals_given').isInt({ min: 0 }).notEmpty(),
  body('referrals_received').isInt({ min: 0 }).notEmpty(),
  body('business_given').isDecimal().notEmpty(),
  body('business_received').isDecimal().notEmpty(),
  body('meetings_attended').isInt({ min: 0 }).notEmpty(),
  body('one_to_ones_held').isInt({ min: 0 }).notEmpty(),
  body('visitors_brought').isInt({ min: 0 }).notEmpty()
];

export const updatePerformanceValidation = [
  param('id').isMongoId(),
  body('username').optional().isString(),
  body('chapter_name').optional().isString(),
  body('period_year').optional().isInt({ min: 1900 }),
  body('period_6month').optional().isInt({ min: 1, max: 2 }),
  body('period_month').optional().isInt({ min: 1, max: 12 }),
  body('referrals_given').optional().isInt({ min: 0 }),
  body('referrals_received').optional().isInt({ min: 0 }),
  body('business_given').optional().isDecimal(),
  body('business_received').optional().isDecimal(),
  body('meetings_attended').optional().isInt({ min: 0 }),
  body('one_to_ones_held').optional().isInt({ min: 0 }),
  body('visitors_brought').optional().isInt({ min: 0 })
];
