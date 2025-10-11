import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  chapter_name: { type: String, required: true, maxlength: 100 },
  chapter_code: { type: String, required: true, maxlength: 20 },
  region_id: { type: mongoose.Schema.Types.ObjectId, ref: 'regions', required: true },
  meeting_day: { type: String, required: true, maxlength: 30 },
  meeting_time: { type: String, required: true },
  meeting_location: { type: String, required: true },
  meeting_address: { type: String, required: true },
  chapter_status: { type: Boolean, required: true },
  founded_date: { type: Date, required: true },
  max_members: { type: Number, required: true },
  current_member_count: { type: Number, required: true }
},
{
  timestamps : true 
}
);

export const Chapter = mongoose.model('chapters', chapterSchema);

const { Schema, Types } = mongoose;

const membershipSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: 'users',
      required: true,
      index: true
    },
    chapter_id: {
      type: Types.ObjectId,
      ref: 'chapters',
      required: true,
      index: true
    },
    role: {
      type: String,
      required: true,
      maxLength: 50,
      trim: true
    },
    membership_status: {
      type: Boolean,
      required: true,
    },
    join_date: {
      type: Date,
      required: true
    },
    renewal_date: {
      type: Date,
      required: true
    },
    termination_date: {
      type: Date
    },
    termination_reason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Membership = mongoose.model('chapter_memberships', membershipSchema);

const chapterSummarySchema = new Schema(
  {
    chapter_id: {
      type: mongoose.Types.ObjectId,
      ref: 'chapters',
      required: true,
      index: true
    },
    period_year: {
      type: Number,
      required: true,
      min: 1900
    },
    period_month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    total_members: {
      type: Number,
      required: true,
      min: 0
    },
    active_members: {
      type: Number,
      required: true,
      min: 0
    },
    total_referrals: {
      type: Number,
      required: true,
      min: 0
    },
    total_business: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: 0,
      get: v => (v ? parseFloat(v.toString()) : 0)
    },
    meetings_held: {
      type: Number,
      required: true,
      min: 0
    },
    average_attendance: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: 0,
      get: v => (v ? parseFloat(v.toString()) : 0)
    },
    visitors_total: {
      type: Number,
      required: true,
      min: 0
    },
    new_members_joined: {
      type: Number,
      required: true,
      min: 0
    },
    members_terminated: {
      type: Number,
      required: true,
      min: 0
    },
    one_to_ones_total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

chapterSummarySchema.index({ chapter_id: 1, period_year: 1, period_month: 1 }, { unique: true });

export const ChapterSummary = mongoose.model('chapter_statistics', chapterSummarySchema);
