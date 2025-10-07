import mongoose from 'mongoose';

const { Schema, Types, Decimal128 } = mongoose;

const performanceSchema = new Schema(
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
    period_year: {
      type: Number,
      required: true
    },
    period_6month: {
      type: Number,
      required: true
    },
    period_month: {
      type: Number,
      required: true
    },
    referrals_given: {
      type: Number,
      required: true,
      min: 0
    },
    referrals_received: {
      type: Number,
      required: true,
      min: 0
    },
    business_given: {
      type: Decimal128,
      required: true,
      min: 0,
      get: v => v ? parseFloat(v.toString()) : 0
    },
    business_received: {
      type: Decimal128,
      required: true,
      min: 0,
      get: v => v ? parseFloat(v.toString()) : 0
    },
    meetings_attended: {
      type: Number,
      required: true,
      min: 0
    },
    one_to_ones_held: {
      type: Number,
      required: true,
      min: 0
    },
    visitors_brought: {
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

performanceSchema.index({ user_id: 1, chapter_id: 1, period_year: 1, period_6month: 1, period_month: 1 }, { unique: true });

export const Performance = mongoose.model('member_statistics', performanceSchema);