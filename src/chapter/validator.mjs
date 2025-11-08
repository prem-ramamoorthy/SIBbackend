import { body, param } from 'express-validator';

export const createChapterValidation = [
  body('chapter_name').isString().isLength({ max: 100 }).notEmpty(),
  body('chapter_code').isString().isLength({ max: 20 }).notEmpty(),
  body('region_name').isString().notEmpty(),
  body('meeting_day').isString().isLength({ max: 30 }).notEmpty(),
  body('meeting_time').isString().notEmpty(),
  body('meeting_location').isString().notEmpty(),
  body('meeting_address').isString().notEmpty(),
  body('chapter_status').isBoolean().notEmpty(),
  body('founded_date').isISO8601().toDate().notEmpty(),
  body('max_members').isInt().notEmpty(),
  body('current_member_count').isInt().notEmpty()
];

export const updateChapterValidation = [
  param('id').isMongoId(),
  body('chapter_name').optional().isString().isLength({ max: 100 }),
  body('chapter_code').optional().isString().isLength({ max: 20 }),
  body('region_name').optional().isString(),
  body('meeting_day').optional().isString().isLength({ max: 30 }),
  body('meeting_time').optional().isString(),
  body('meeting_location').optional().isString(),
  body('meeting_address').optional().isString(),
  body('chapter_status').optional().isString().isLength({ max: 10 }),
  body('founded_date').optional().isISO8601().toDate(),
  body('max_members').optional().isInt(),
  body('current_member_count').optional().isInt()
];

export const idValidation = [
  param('id').isMongoId()
];

export const createMembershipValidation = [
  body('username').isString().notEmpty(),
  body('role').isString().isLength({ max: 50 }).notEmpty(),
  body('membership_status').isBoolean().notEmpty(),
  body('join_date').isISO8601().toDate().notEmpty(),
  body('renewal_date').isISO8601().toDate().notEmpty(),
  body('termination_date').optional().isISO8601().toDate(),
  body('termination_reason').optional().isString()
];

export const updateMembershipValidation = [
  param('id').isMongoId(),
  body('username').optional().isString(),
  body('chapter_name').optional().isString(),
  body('role').optional().isString().isLength({ max: 50 }),
  body('membership_status').optional().isBoolean(),
  body('join_date').optional().isISO8601().toDate(),
  body('renewal_date').optional().isISO8601().toDate(),
  body('termination_date').optional().isISO8601().toDate(),
  body('termination_reason').optional().isString()
];

export const createSummaryValidation = [
  body('chapter_name').isString().notEmpty(),
  body('period_year').isInt({ min: 1900 }).notEmpty(),
  body('period_month').isInt({ min: 1, max: 12 }).notEmpty(),
  body('total_members').isInt({ min: 0 }).notEmpty(),
  body('active_members').isInt({ min: 0 }).notEmpty(),
  body('total_referrals').isInt({ min: 0 }).notEmpty(),
  body('total_business').isDecimal().notEmpty(),
  body('meetings_held').isInt({ min: 0 }).notEmpty(),
  body('average_attendance').isDecimal().notEmpty(),
  body('visitors_total').isInt({ min: 0 }).notEmpty(),
  body('new_members_joined').isInt({ min: 0 }).notEmpty(),
  body('members_terminated').isInt({ min: 0 }).notEmpty(),
  body('one_to_ones_total').isInt({ min: 0 }).notEmpty()
];

export const updateSummaryValidation = [
  param('id').isMongoId(),
  body('chapter_name').optional().isString(),
  body('period_year').optional().isInt({ min: 1900 }),
  body('period_month').optional().isInt({ min: 1, max: 12 }),
  body('total_members').optional().isInt({ min: 0 }),
  body('active_members').optional().isInt({ min: 0 }),
  body('total_referrals').optional().isInt({ min: 0 }),
  body('total_business').optional().isDecimal(),
  body('meetings_held').optional().isInt({ min: 0 }),
  body('average_attendance').optional().isDecimal(),
  body('visitors_total').optional().isInt({ min: 0 }),
  body('new_members_joined').optional().isInt({ min: 0 }),
  body('members_terminated').optional().isInt({ min: 0 }),
  body('one_to_ones_total').optional().isInt({ min: 0 })
];