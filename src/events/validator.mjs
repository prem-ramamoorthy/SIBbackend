import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid event id')
];

export const createEventValidation = [
  body('chapter_name').isString().notEmpty(),
  body('event_title').isString().isLength({ max: 255 }).notEmpty(),
  body('event_description').isString().notEmpty(),
  body('event_date').isISO8601().toDate().notEmpty(),
  body('event_time').isString().notEmpty(),
  body('location').isString().notEmpty(),
  body('organizer_company').isString().isLength({ max: 100 }).notEmpty(),
  body('vat_number').isString().isLength({ max: 20 }).notEmpty(),
  body('event_type').isString().isLength({ max: 50 }).notEmpty(),
  body('max_attendees').isInt({ min: 0 }).notEmpty(),
  body('current_attendees').isInt({ min: 0 }).notEmpty(),
  body('event_status').isString().isLength({ max: 20 }).notEmpty(),
  body('created_by_username').isString().notEmpty()
];

export const updateEventValidation = [
  param('id').isMongoId(),
  body('chapter_name').optional().isString(),
  body('event_title').optional().isString().isLength({ max: 255 }),
  body('event_description').optional().isString(),
  body('event_date').optional().isISO8601().toDate(),
  body('event_time').optional().isString(),
  body('location').optional().isString(),
  body('organizer_company').optional().isString().isLength({ max: 100 }),
  body('vat_number').optional().isString().isLength({ max: 20 }),
  body('event_type').optional().isString().isLength({ max: 50 }),
  body('max_attendees').optional().isInt({ min: 0 }),
  body('current_attendees').optional().isInt({ min: 0 }),
  body('event_status').optional().isString().isLength({ max: 20 }),
  body('created_by_username').optional().isString()
];
