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
});

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
});

export const Vertical = mongoose.model('Vertical', verticalSchema);