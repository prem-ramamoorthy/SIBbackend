import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const oneToOneMeetingSchema = new Schema({
  member1_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  member2_id: {
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
  meeting_date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  discussion_points: {
    type: String,
    trim: true
  },
  created_by: {
    type: Types.ObjectId,
    ref: 'users',
    required: true
  },
  status: {
    type: Boolean,
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

const referralSchema = new Schema(
  {
    referrer_id: {
      type: Types.ObjectId,
      ref: "users",
      required: [true, "Referrer ID is required"],
      index: true
    },
    referee_id: {
      type: Types.ObjectId,
      ref: "users",
      required: [true, "Referee ID is required"],
      index: true
    },
    contact_name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    referral_type: {
      type: String,
      required: [true, "Referral type is required"],
      trim: true,
      maxlength: 20
    },
    referral_status: {
      type: [String],
      trim: true,
    },
    contact_phone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
      maxlength: 20
    },
    contact_email: {
      type: String,
      trim: true,
      maxlength: 100,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },
    contact_address: {
      type: String,
      trim: true,
      default: ""
    },
    comments: {
      type: String,
      trim: true,
      default: ""
    },
    hot: {
      type: String,
      required: [true, "Hot status is required"],
      trim: true,
      maxlength: 20
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

export const Referral = mongoose.model("referrals", referralSchema);

const visitorSchema = new Schema({
  inviting_member_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  visitor_name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  visitor_company: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  visitor_phone: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  visitor_email: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  business_category: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  industry: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  presentation_given: {
    type: Boolean,
    required: true
  },
  follow_up_notes: {
    type: String,
    trim: true
  },
  converted_to_member: {
    type: Boolean,
    required: true
  },
  member_user_id: {
    type: Types.ObjectId,
    ref: 'users',
    default: null
  },
  status: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

visitorSchema.index({ inviting_member_id: 1, visitor_email: 1 });

export const Visitor = mongoose.model('visitors', visitorSchema);

const tyftbSchema = new Schema({
  referral_id: {
    type: Types.ObjectId,
    ref: 'referrals',
    index: true
  },
  payer_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  receiver_id: {
    type: Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  business_type: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  referral_type: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  business_amount: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: 0,
    get: v => (v ? parseFloat(v.toString()) : 0)
  },
  business_description: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

tyftbSchema.index({ payer_id: 1, receiver_id: 1, date_closed: -1 });

export const TYFTB = mongoose.model('tyftb', tyftbSchema);
