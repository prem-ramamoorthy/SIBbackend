import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema({
  region_name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  region_code: {
    type: String,
    required: true,
    maxlength: 10,
  },
  country: {
    type: String,
    required: true,
    maxlength: 50,
  },
  created_at: {
    type: Date,
    required: true,
  },
},
  {
    timestamps: true
  }
);

export const Region = mongoose.model('Region', regionSchema);

const verticalSchema = new mongoose.Schema({
  vertical_name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  vertical_code: {
    type: String,
    required: true,
    maxlength: 20,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
},
  {
    timestamps: true
  }
);

export const Vertical = mongoose.model('Vertical', verticalSchema);

const coordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  chapter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chapters',
    required: true
  }
}, { timestamps: true });

export const Coordinator = mongoose.model('coordinators', coordinatorSchema);
