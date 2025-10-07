import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid meeting id')
];

export const createOneToOneMeetingValidation = [
  body('member1_name').isString().notEmpty(),
  body('member2_name').isString().notEmpty(),
  body('chapter_name').isString().notEmpty(),
  body('meeting_date').isISO8601().toDate().notEmpty(),
  body('meeting_time').isString().notEmpty(),
  body('location').isString().isLength({ max: 255 }).notEmpty(),
  body('duration_minutes').isInt({ min: 1 }).notEmpty(),
  body('discussion_points').optional().isString(),
  body('gains_discussed').optional().isString(),
  body('status').isString().isLength({ max: 20 }).notEmpty(),
  body('photo').optional().isString().isLength({ max: 500 }),
  body('created_by_username').isString().notEmpty()
];

export const updateOneToOneMeetingValidation = [
  param('id').isMongoId(),
  body('member1_name').optional().isString(),
  body('member2_name').optional().isString(),
  body('chapter_name').optional().isString(),
  body('meeting_date').optional().isISO8601().toDate(),
  body('meeting_time').optional().isString(),
  body('location').optional().isString().isLength({ max: 255 }),
  body('duration_minutes').optional().isInt({ min: 1 }),
  body('discussion_points').optional().isString(),
  body('gains_discussed').optional().isString(),
  body('status').optional().isString().isLength({ max: 20 }),
  body('photo').optional().isString().isLength({ max: 500 }),
  body('created_by_username').optional().isString()
];
