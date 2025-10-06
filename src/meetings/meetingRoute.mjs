import express from 'express';
import mongoose from 'mongoose';
import { Meeting } from './MeetingsSchema.mjs';
import {
  idValidation,
  createMeetingValidation,
  updateMeetingValidation
} from './validator.mjs';
import { handleValidationErrors , authenticateCookie , mapChapterNamesToIds } from '../middlewares.mjs';

const router = express.Router();

router.post(
  '/createmeeting',
  createMeetingValidation,
  handleValidationErrors,
  mapChapterNamesToIds,
  authenticateCookie ,
  async (req, res) => {
    try {
      if (!req.body.chapter_id) {
        return res.status(400).json({ message: 'Valid chapter_name is required.' });
      }
      const meeting = new Meeting(req.body);
      const saved = await meeting.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getmeetings', authenticateCookie ,async (req, res) => {
  try {
    const docs = await Meeting.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapter_id',
          foreignField: '_id',
          as: 'chapter'
        }
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          meeting_date: 1,
          meeting_time: 1,
          meeting_type: 1,
          location: 1,
          agenda: 1,
          meeting_notes: 1,
          total_attendees: 1,
          total_visitors: 1,
          total_referrals: 1,
          total_tyftb: 1,
          meeting_status: 1,
          createdAt: 1,
          updatedAt: 1,
          chapter: { _id: 1, chapter_name: 1, chapter_code: 1 }
        }
      }
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getmeetingbyid/:id', authenticateCookie ,idValidation, handleValidationErrors, async (req, res) => {
  try {
    const [doc] = await Meeting.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapter_id',
          foreignField: '_id',
          as: 'chapter'
        }
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          meeting_date: 1,
          meeting_time: 1,
          meeting_type: 1,
          location: 1,
          agenda: 1,
          meeting_notes: 1,
          total_attendees: 1,
          total_visitors: 1,
          total_referrals: 1,
          total_tyftb: 1,
          meeting_status: 1,
          createdAt: 1,
          updatedAt: 1,
          chapter: { _id: 1, chapter_name: 1, chapter_code: 1 }
        }
      }
    ]);
    if (!doc) return res.status(404).json({ message: 'Meeting not found' });
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updatemeetingbyid/:id',
  authenticateCookie ,
  updateMeetingValidation,
  handleValidationErrors,
  mapChapterNamesToIds,
  async (req, res) => {
    try {
      const updated = await Meeting.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated)
        return res.status(404).json({ message: 'Meeting not found' });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete('/deletemeetingbyid/:id',authenticateCookie , idValidation, handleValidationErrors, async (req, res) => {
  try {
    const deleted = await Meeting.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Meeting not found' });
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
