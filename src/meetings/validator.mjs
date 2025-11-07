import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid meeting id')
];

export const createMeetingValidation = [
  body('meeting_date').isISO8601().toDate().notEmpty(),
  body('meeting_time').isString().notEmpty(),
  body('title').isString().notEmpty().isLength({ max: 200 }),
  body('meeting_type').isString().isLength({ max: 50 }).notEmpty(),
  body('location').isString().notEmpty(),
  body('meeting_notes').isString().optional(),
  body('duration').isNumeric().optional(),
  body('meeting_status').isString().isLength({ max: 50 }).notEmpty()
];

export const updateMeetingValidation = [
  param('id').isMongoId(),
  body('meeting_date').optional().isISO8601().toDate(),
  body('meeting_time').optional().isString(),
  body('title').isString().isLength({ max: 200 }).optional(),
  body('meeting_type').optional().isString().isLength({ max: 50 }),
  body('location').optional().isString(),
  body('meeting_notes').optional().isString(),
  body('duration').optional().isNumeric(),
  body('meeting_status').optional().isBoolean().isLength({ max: 20 })
];

export const createAttendanceValidation = [
  body('username').isString().notEmpty(),
  body('attendance_status').isString().isLength({ max: 20 }).notEmpty(),
  body('substitute_username').optional().isString(),
  body('absence_reason').optional().isString().isLength({ max: 255 }),
  body('notes').optional().isString(),
  body('created_at').isISO8601().toDate().notEmpty()
];

export const updateAttendanceValidation = [
  param('id').isMongoId(),
  body('username').optional().isString(),
  body('attendance_status').optional().isString().isLength({ max: 20 }),
  body('substitute_username').optional().isString(),
  body('absence_reason').optional().isString().isLength({ max: 255 }),
  body('notes').optional().isString(),
  body('created_at').optional().isISO8601().toDate()
];