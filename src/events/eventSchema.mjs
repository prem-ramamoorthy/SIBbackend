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
    required: true,
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
  vat_number: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  event_type: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  max_attendees: {
    type: Number,
    required: true,
    min: 0
  },
  current_attendees: {
    type: Number,
    required: true,
    min: 0
  },
  event_status: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  created_by: {
    type: Types.ObjectId,
    ref: 'users',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

eventSchema.index({ chapter_id: 1, event_date: -1 });

export const Event = mongoose.model('events', eventSchema);
