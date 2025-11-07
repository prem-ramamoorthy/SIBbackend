import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const eventSchema = new Schema({
  chapter_id: {
    type: Types.ObjectId,
    ref: 'chapters',
    required: true,
    index: true
  },
  event_title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  event_description: {
    type: String,
    trim: true
  },
  event_date: {
    type: Date,
    required: true
  },
  event_time: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  organizer_company: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  event_type: {
    type: String,
    required: true,
    enum: {
      values: ['weekly', 'monthly', 'others'],
      message: 'meeting status must be a valid type',
    },
    trim: true,
    maxLength: 50
  },
  event_status: {
    type: String,
    enum: {
      values: ['completed', 'upcoming', 'cancelled', 'inprogress'],
      message: 'meeting status must be a valid type',
    },
    required: true,
    trim: true,
    maxLength: 20
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

eventSchema.index({ chapter_id: 1, event_date: -1 });

export const Event = mongoose.model('events', eventSchema);
