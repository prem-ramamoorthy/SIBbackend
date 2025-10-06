import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^(https?:\/\/)([\w.-]+)(:[0-9]+)?(\/.*)?$/i;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const profileSchema = new Schema(
  {
    display_name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50
    },
    user_id: {
      type: Types.ObjectId,
      ref: 'users',
      required: true,
      index: true
    },
    profile_image_url: {
      type: String,
      trim: true,
      maxLength: 255,
      validate: {
        validator: v => !v || urlRegex.test(v),
        message: 'profile_image_url must be a valid URL'
      }
    },
    company_phone: {
      type: String,
      trim: true,
      maxLength: 20,
      required: true
    },
    company_email: {
      type: String,
      trim: true,
      lowercase: true,
      maxLength: 100,
      required: true,
      match: [emailRegex, 'company_email must be a valid email']
    },
    company_address: {
      type: String,
      required: true,
      trim: true
    },
    personal_address: {
      type: String,
      required: true,
      trim: true
    },
    dob: {
      type: Date,
      required: true
    },
    wedding_date: {
      type: Date,
      required: true
    },
    blood_group: {
      type: String,
      required: true,
      trim: true,
      maxLength: 5,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: 'blood_group must be a valid type'
      }
    },
    vagai_category: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    kulam_category: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    native_place: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    kuladeivam: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    company_name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    vertical_id: {
      type: Types.ObjectId,
      ref: 'verticals',
      required: true,
      index: true
    },
    gst_number: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxLength: 20,
      match: [gstRegex, 'gst_number must be a valid GSTIN (15 chars)']
    },
    years_in_business: {
      type: Number,
      required: true,
      min: [0, 'years_in_business cannot be negative']
    },
    annual_turnover: {
      type: Number,
      required: true,
      min: [0, 'annual_turnover cannot be negative']
    },
    website: {
      type: String,
      trim: true,
      maxLength: 255,
      required: true,
      match: [urlRegex, 'website must be a valid URL starting with http or https']
    },
    services_offered: {
      type: String,
      required: true,
      trim: true
    },
    ideal_referral: {
      type: String,
      required: true,
      trim: true
    },
    gains_goals: {
      type: String,
      required: true,
      trim: true
    },
    gains_accomplishments: {
      type: String,
      required: true,
      trim: true
    },
    gains_interests: {
      type: String,
      required: true,
      trim: true
    },
    gains_networks: {
      type: String,
      required: true,
      trim: true
    },
    gains_skills: {
      type: String,
      required: true,
      trim: true
    },
    elevator_pitch_30s: {
      type: String,
      required: true,
      trim: true
    },
    why_sib: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

profileSchema.index({ user_id: 1 }, { unique: true });
profileSchema.index({ display_name: 1 }, { unique: false });
profileSchema.index({ company_email: 1 }, { unique: false });

profileSchema.path('dob').validate(function (v) {
  return v <= new Date();
}, 'dob cannot be in the future');

profileSchema.path('wedding_date').validate(function (v) {
  return v <= new Date();
}, 'wedding_date cannot be in the future');

export const MemberProfile = mongoose.model('profiles', profileSchema);
