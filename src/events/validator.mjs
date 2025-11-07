import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid event id')
];

export const createEventValidation = [
  body('event_title').isString().isLength({ max: 255 }).notEmpty(),
  body('event_description').isString().optional(),
  body('event_date').isISO8601().toDate().notEmpty(),
  body('event_time').isString().notEmpty(),
  body('location').isString().notEmpty(),
  body('organizer_company').isString().isLength({ max: 100 }).notEmpty(),
  body('event_type').isString().isLength({ max: 50 }).notEmpty(),
  body('event_status').isString().isLength({ max: 20 }).notEmpty(),
];

export const updateEventValidation = [
  body('event_title').optional().isString().isLength({ max: 255 }),
  body('event_description').optional().isString(),
  body('event_date').optional().isISO8601().toDate(),
  body('event_time').optional().isString(),
  body('location').optional().isString(),
  body('organizer_company').optional().isString().isLength({ max: 100 }),
  body('event_type').optional().isString().isLength({ max: 50 }),
  body('event_status').optional().isString().isLength({ max: 20 }),
];