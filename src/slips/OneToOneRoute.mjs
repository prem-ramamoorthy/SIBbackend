import express from 'express';
import mongoose from 'mongoose';
import { OneToOneMeeting } from './slipsSchema.mjs';
import {
  idValidation,
  createOneToOneMeetingValidation,
  updateOneToOneMeetingValidation
} from './validator.mjs';
import {mapNamesToIds, authenticateCookie , handleValidationErrors} from '../middlewares.mjs'

const router = express.Router();

router.post(
  '/createone2one',
  createOneToOneMeetingValidation,
  handleValidationErrors,
  mapNamesToIds, authenticateCookie ,
  async (req, res) => {
    try {
      if (!req.body.member1_id || !req.body.member2_id || !req.body.chapter_id || !req.body.created_by)
        return res.status(400).json({ message: 'All member, chapter, and user references are required and must be valid.' });
      const meeting = new OneToOneMeeting(req.body);
      const saved = await meeting.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getone2ones', authenticateCookie ,async (req, res) => {
  try {
    const docs = await OneToOneMeeting.aggregate([
      { $sort: { meeting_date: -1 } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'member1_id',
          foreignField: '_id',
          as: 'member1'
        }
      },
      { $unwind: { path: '$member1', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'member2_id',
          foreignField: '_id',
          as: 'member2'
        }
      },
      { $unwind: { path: '$member2', preserveNullAndEmptyArrays: true } },
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
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      { $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } }
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getone2onebyid/:id',authenticateCookie , idValidation, handleValidationErrors, async (req, res) => {
  try {
    const [doc] = await OneToOneMeeting.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'member1_id',
          foreignField: '_id',
          as: 'member1'
        }
      },
      { $unwind: { path: '$member1', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'member2_id',
          foreignField: '_id',
          as: 'member2'
        }
      },
      { $unwind: { path: '$member2', preserveNullAndEmptyArrays: true } },
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
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      { $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } }
    ]);
    if (!doc) return res.status(404).json({ message: 'Meeting not found' });
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updateone2onebyid/:id',
  updateOneToOneMeetingValidation,
  handleValidationErrors,
  mapNamesToIds, authenticateCookie ,
  async (req, res) => {
    try {
      const updated = await OneToOneMeeting.findByIdAndUpdate(
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

router.delete('/deleteone2onebyid/:id', authenticateCookie ,idValidation, handleValidationErrors, async (req, res) => {
  try {
    const deleted = await OneToOneMeeting.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Meeting not found' });
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;