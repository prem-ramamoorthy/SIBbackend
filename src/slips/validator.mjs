import { body, param } from 'express-validator';

export const idValidation = [
  param('id').isMongoId().withMessage('Invalid meeting id')
];

export const createOneToOneMeetingValidation = [
  body('member2_name').isString().notEmpty(),
  body('chapter_name').isString().notEmpty(),
  body('meeting_date').isISO8601().toDate().notEmpty(),
  body('location').isString().isLength({ max: 255 }).notEmpty(),
  body('discussion_points').optional().isString(),
  body('created_by_username').isString().notEmpty(),
  body('status').isBoolean().notEmpty(),
];

export const updateOneToOneMeetingValidation = [
  param('id').isMongoId(),
  body('member1_name').optional().isString(),
  body('member2_name').optional().isString(),
  body('chapter_name').optional().isString(),
  body('meeting_date').optional().isISO8601().toDate(),
  body('location').optional().isString().isLength({ max: 255 }),
  body('discussion_points').optional().isString(),
  body('created_by_username').optional().isString(),
  body('status').isBoolean().optional(),
];

export const createReferralValidation = [
  body('referrer_username').isString().notEmpty(),
  body('referee_username').isString().notEmpty(),
  body('contact_name').isString().isLength({ max: 100 }).optional(),
  body('description').isString().notEmpty(),
  body('referral_type').isString().isLength({ max: 20 }).notEmpty(),
  body('referral_status').isArray({ max: 3 }),
  body('contact_phone').isString().isLength({ max: 20 }).isNumeric(),
  body('contact_email').isEmail().isLength({ max: 100 }).optional(),
  body('contact_address').isString().optional(),
  body('comments').isString().optional(),
  body('hot').isString().isLength({ max: 20 }).notEmpty(),
  body('created_at').isISO8601().toDate().notEmpty(),
  body('status').isBoolean().notEmpty(),
];

export const updateReferralValidation = [
  param('id').isMongoId(),
  body('referrer_username').optional().isString(),
  body('referee_username').optional().isString(),
  body('contact_name').optional().isString().isLength({ max: 100 }),
  body('description').optional().isString(),
  body('referral_type').optional().isString().isLength({ max: 20 }),
  body('referral_status').optional().isArray({ max: 3 }),
  body('contact_phone').optional().isString().isLength({ max: 20 }),
  body('contact_email').optional().isEmail().isLength({ max: 100 }),
  body('contact_address').optional().isString(),
  body('comments').optional().isString(),
  body('hot').optional().isString().isLength({ max: 20 }),
  body('created_at').optional().isISO8601().toDate(),
  body('status').isBoolean().optional(),
];

export const createVisitorValidation = [
  body('inviting_member_display_name').isString().notEmpty(),
  body('visitor_name').isString().isLength({ max: 100 }).notEmpty(),
  body('visitor_company').isString().isLength({ max: 100 }).notEmpty(),
  body('visitor_phone').isString().isLength({ max: 20 }).notEmpty(),
  body('visitor_email').isString().isLength({ max: 100 }).notEmpty(),
  body('business_category').isString().isLength({ max: 100 }).notEmpty(),
  body('industry').isString().isLength({ max: 100 }).notEmpty(),
  body('presentation_given').isBoolean().notEmpty(),
  body('follow_up_notes').optional().isString(),
  body('converted_to_member').isBoolean().notEmpty(),
  body('member_username').optional().isString(),
  body('status').isBoolean().notEmpty(),
];

export const updateVisitorValidation = [
  param('id').isMongoId(),
  body('inviting_member_display_name').optional().isString(),
  body('visitor_name').optional().isString().isLength({ max: 100 }),
  body('visitor_company').optional().isString().isLength({ max: 100 }),
  body('visitor_phone').optional().isString().isLength({ max: 20 }),
  body('visitor_email').optional().isString().isLength({ max: 100 }),
  body('business_category').optional().isString().isLength({ max: 100 }),
  body('industry').optional().isString().isLength({ max: 100 }),
  body('presentation_given').optional().isBoolean(),
  body('follow_up_notes').optional().isString(),
  body('converted_to_member').optional().isBoolean(),
  body('member_username').optional().isString(),
  body('status').isBoolean().optional(),
];

export const createTyftbValidation = [
  body('referral_code').isString().isLength({ max: 20 }).optional(),
  body('receiver_displayname').isString().notEmpty(),
  body('business_type').isString().notEmpty().isLength({ max: 50 }),
  body('referral_type').isString().notEmpty().isLength({ max: 20 }),
  body('business_amount').isDecimal().notEmpty(),
  body('business_description').isString().optional(),
  body('created_at').isISO8601().notEmpty(),
  body('status').isBoolean().notEmpty(),
];

export const updateTyftbValidation = [
  param('id').isMongoId(),
  body('referral_code').optional().isString().isLength({ max: 20 }),
  body('payer_displayname').optional().isString(),
  body('receiver_displayname').optional().isString(),
  body('business_type').optional().isString().isLength({ max: 50 }),
  body('referral_type').optional().isString().isLength({ max: 20 }),
  body('business_amount').optional().isDecimal(),
  body('business_description').optional().isString(),
  body('created_at').optional().isISO8601(),
  body('status').isBoolean().optional(),
];