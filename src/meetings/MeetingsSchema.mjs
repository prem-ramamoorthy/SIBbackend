import mongoose from 'mongoose';

const { Schema, Types, Decimal128 } = mongoose;

const meetingSchema = new Schema(
  {
    chapter_id: {
      type: Types.ObjectId,
      ref: 'Chapter',
      required: true,
      index: true
    },
    meeting_date: {
      type: Date,
      required: true
    },
    meeting_time: {
      type: String,
      required: true,
      trim: true
    },
    meeting_type: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    agenda: {
      type: String,
      required: true,
      trim: true
    },
    meeting_notes: {
      type: String,
      required: true,
      trim: true
    },
    total_attendees: {
      type: Number,
      required: true,
      min: 0
    },
    total_visitors: {
      type: Number,
      required: true,
      min: 0
    },
    total_referrals: {
      type: Number,
      required: true,
      min: 0
    },
    total_tyftb: {
      type: Decimal128,
      required: true,
      get: v => (v ? parseFloat(v.toString()) : 0),
      min: 0
    },
    meeting_status: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

meetingSchema.index({ chapter_id: 1, meeting_date: 1 });

export const Meeting = mongoose.model('meetings', meetingSchema);