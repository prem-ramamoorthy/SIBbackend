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
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200
    },
    meeting_type: {
      type: String,
      enum: {
        values: ['weekly', 'monthly', 'others'],
        message: 'meeting status must be a valid type',
      },
      required: true,
      trim: true,
      maxLength: 50
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    meeting_notes: {
      type: String,
      default: "",
      trim: true
    },
    duration: {
      type: Number,
      min: 0,
      required : true,
      default: 0
    },
    meeting_status: {
      type: String,
      enum: {
        values: ['completed', 'upcoming', 'cancelled', 'inprogress'],
        message: 'meeting status must be a valid type',
      },
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

const attendanceSchema = new Schema({
  user_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  attendance_status: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  substitute_user_id: {
    type: Types.ObjectId,
    ref: 'users',
    default: null,
    index: true
  },
  absence_reason: {
    type: String,
    trim: true,
    maxLength: 255
  },
  notes: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  }
},
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  });

attendanceSchema.index({ user_id: 1, created_at: 1 });

export const Attendance = mongoose.model('attendance', attendanceSchema);