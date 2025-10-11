import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid meeting id')
];

export const createMeetingValidation = [
  body('chapter_name').isString().notEmpty(),
  body('meeting_date').isISO8601().toDate().notEmpty(),
  body('meeting_time').isString().notEmpty(),
  body('meeting_type').isString().isLength({ max: 50 }).notEmpty(),
  body('location').isString().notEmpty(),
  body('agenda').isString().notEmpty(),
  body('meeting_notes').isString().notEmpty(),
  body('total_attendees').isInt({ min: 0 }).notEmpty(),
  body('total_visitors').isInt({ min: 0 }).notEmpty(),
  body('total_referrals').isInt({ min: 0 }).notEmpty(),
  body('total_tyftb').isDecimal().notEmpty(),
  body('meeting_status').isBoolean().isLength({ max: 20 }).notEmpty()
];

export const updateMeetingValidation = [
  param('id').isMongoId(),
  body('chapter_name').optional().isString(),
  body('meeting_date').optional().isISO8601().toDate(),
  body('meeting_time').optional().isString(),
  body('meeting_type').optional().isString().isLength({ max: 50 }),
  body('location').optional().isString(),
  body('agenda').optional().isString(),
  body('meeting_notes').optional().isString(),
  body('total_attendees').optional().isInt({ min: 0 }),
  body('total_visitors').optional().isInt({ min: 0 }),
  body('total_referrals').optional().isInt({ min: 0 }),
  body('total_tyftb').optional().isDecimal(),
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