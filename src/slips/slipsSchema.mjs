import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const oneToOneMeetingSchema = new Schema({
    member1_id: {
        type: Types.ObjectId,
        ref: 'profiles',
        required: true,
        index: true
    },
    member2_id: {
        type: Types.ObjectId,
        ref: 'profiles',
        required: true,
        index: true
    },
    chapter_id: {
        type: Types.ObjectId,
        ref: 'Chapters',
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
    location: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255
    },
    duration_minutes: {
        type: Number,
        required: true,
        min: 1
    },
    discussion_points: {
        type: String,
        trim: true
    },
    gains_discussed: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20
    },
    photo: {
        type: String,
        trim: true,
        maxLength: 500
    },
    created_by: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

oneToOneMeetingSchema.index({ chapter_id: 1, meeting_date: -1 });

export const OneToOneMeeting = mongoose.model('one_to_one_meetings', oneToOneMeetingSchema);

const referralSchema = new Schema({
  referral_code: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  referrer_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  referee_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  contact_name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  referral_type: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  referral_category: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  contact_phone: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  contact_email: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  contact_date: {
    type: Date,
    required: true
  },
  comments: {
    type: String,
    required: true,
    trim: true
  },
  hot: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  referral_status: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
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

referralSchema.index({ referral_code: 1 }, { unique: true });

export const Referral = mongoose.model('referrals', referralSchema);
