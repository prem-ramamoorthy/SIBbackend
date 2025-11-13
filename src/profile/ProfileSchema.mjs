import mongoose from 'mongoose';

const { Schema } = mongoose;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const profileSchema = new Schema(
  {
    display_name: {
      type: String,
      trim: true,
      maxlength: 50,
      default: null,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
      unique: true,
    },
    chapter_id: {
      type: Schema.Types.ObjectId,
      ref: 'chapters',
      required: true,
    },
    region_id :{
      type: Schema.Types.ObjectId,
      ref: 'regions',
      required: true,
    },
    profile_image_url: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },
    company_phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    company_email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [emailRegex, 'company_email must be a valid email'],
      default: null,
    },
    company_address: {
      type: String,
      trim: true,
      default: null,
    },
    personal_address: {
      type: String,
      trim: true,
      default: null,
    },
    dob: {
      type: Date,
      validate: {
        validator: v => !v || v <= new Date(),
        message: 'dob cannot be in the future',
      },
      default: null,
    },
    wedding_date: {
      type: Date,
      validate: {
        validator: v => !v || v <= new Date(),
        message: 'wedding_date cannot be in the future',
      },
      default: null,
    },
    blood_group: {
      type: String,
      trim: true,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: 'blood_group must be a valid type',
      },
      default: "A+",
    },
    vagai_category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    kulam_category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    native_place: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    kuladeivam: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    company_name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    vertical_ids: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'verticals',
        },
      ],
      default: [],
    },

    years_in_business: {
      type: Number,
      min: [0, 'years_in_business cannot be negative'],
      default: null,
    },
    annual_turnover: {
      type: Number,
      min: [0, 'annual_turnover cannot be negative'],
      default: null,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },

    services: {
      type: [String],
      validate: {
        validator: arr =>
          !arr || arr.length === 0 || arr.every(s => typeof s === 'string' && s.trim().length > 0),
        message: 'services must be an array of non-empty strings',
      },
      default: [],
    },

    ideal_referral: {
      type: String,
      trim: true,
      default: null,
    },

    bio: {
      type: String,
      trim: true,
      default: null,
    },

    elevator_pitch_30s: {
      type: String,
      trim: true,
      default: null,
    },
    why_sib: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'profiles',
  }
);

export const MemberProfile = mongoose.model('profiles', profileSchema);
