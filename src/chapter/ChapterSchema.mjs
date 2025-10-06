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
});

export const Chapter = mongoose.model('Chapter', chapterSchema);