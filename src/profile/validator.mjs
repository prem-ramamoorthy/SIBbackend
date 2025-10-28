import { body, param } from 'express-validator';
import mongoose from 'mongoose';

const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const isValidObjectIdArray = (arr) => Array.isArray(arr) && arr.every(id => mongoose.Types.ObjectId.isValid(id));

export const idValidation = [
  param('id')
    .bail()
    .isMongoId()
    .withMessage('Invalid profile id')
];

export const createProfileValidation = [
  body('display_name')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 50 }),

  body('profile_image_url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('profile_image_url must be a valid URL'),

  body('company_phone')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 20 }),

  body('company_email')
    .optional({ checkFalsy: true })
    .isEmail()
    .isLength({ max: 100 }),

  body('company_address')
    .optional({ checkFalsy: true })
    .isString(),

  body('personal_address')
    .optional({ checkFalsy: true })
    .isString(),

  body('dob')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom(v => v <= new Date())
    .withMessage('dob cannot be in the future'),

  body('wedding_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom(v => v <= new Date())
    .withMessage('wedding_date cannot be in the future'),

  body('blood_group')
    .optional({ checkFalsy: true })
    .isIn(validBloodGroups)
    .withMessage('Invalid blood group'),

  body('vagai_category').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('kulam_category').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('native_place').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('kuladeivam').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('company_name').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),

  body('vertical_ids')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('vertical_ids must be an array of Strings')
    .custom(arr => arr.every(id => typeof id === 'string' && id.trim().length > 0))
    .withMessage('Each vertical_id must be a valid Name'),

  body('years_in_business')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('years_in_business cannot be negative'),

  body('annual_turnover')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('annual_turnover cannot be negative'),

  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .isLength({ max: 255 })
    .withMessage('website must be a valid URL starting with http or https'),

  body('services')
    .optional({ checkFalsy: true })
    .isArray()
    .custom(arr => arr.every(s => typeof s === 'string' && s.trim().length > 0))
    .withMessage('services must be an array of non-empty strings'),

  body('ideal_referral').optional({ checkFalsy: true }).isString(),
  body('bio').optional({ checkFalsy: true }).isString(),
  body('elevator_pitch_30s').optional({ checkFalsy: true }).isString(),
  body('why_sib').optional({ checkFalsy: true }).isString(),
];

export const updateProfileValidation = [
  param('id')
    .bail()
    .isMongoId()
    .withMessage('Invalid profile id'),

  body('display_name').optional({ checkFalsy: true }).isString().isLength({ max: 50 }),
  body('profile_image_url').optional({ checkFalsy: true }).isURL(),
  body('company_phone').optional({ checkFalsy: true }).isString().isLength({ max: 20 }),
  body('company_email').optional({ checkFalsy: true }).isEmail().isLength({ max: 100 }),
  body('company_address').optional({ checkFalsy: true }).isString(),
  body('personal_address').optional({ checkFalsy: true }).isString(),

  body('dob')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom(v => v <= new Date())
    .withMessage('dob cannot be in the future'),

  body('wedding_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom(v => v <= new Date())
    .withMessage('wedding_date cannot be in the future'),

  body('blood_group').optional({ checkFalsy: true }).isIn(validBloodGroups),

  body('vagai_category').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('kulam_category').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('native_place').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('kuladeivam').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  body('company_name').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),

  body('vertical_ids')
    .optional({ checkFalsy: true })
    .isArray()
    .custom(arr => arr.every(id => typeof id === 'string' && id.trim().length > 0))
    .withMessage('Each vertical_id must be a valid Name'),

  body('years_in_business').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('annual_turnover').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('website').optional({ checkFalsy: true }).isURL().isLength({ max: 255 }),

  body('services')
    .optional({ checkFalsy: true })
    .isArray()
    .custom(arr => arr.every(s => typeof s === 'string' && s.trim().length > 0))
    .withMessage('services must be an array of non-empty strings'),

  body('ideal_referral').optional({ checkFalsy: true }).isString(),
  body('bio').optional({ checkFalsy: true }).isString(),
  body('elevator_pitch_30s').optional({ checkFalsy: true }).isString(),
  body('why_sib').optional({ checkFalsy: true }).isString(),
];