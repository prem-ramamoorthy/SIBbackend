import express from 'express';
import { Membership} from './ChapterSchema.mjs';
import {handleValidationErrors , mapChapterNamesToIds , authenticateCookie} from '../middlewares.mjs'
import {
  idValidation,
  createMembershipValidation,
  updateMembershipValidation
} from './validator.mjs';
import mongoose from 'mongoose';

const router = express.Router();

router.post(
  '/createmembership',
  authenticateCookie,
  createMembershipValidation,
  handleValidationErrors,
  mapChapterNamesToIds,
  async (req, res) => {
    try {
      if (!req.body.user_id || !req.body.chapter_id) {
        return res.status(400).json({ message: 'Both valid username and chapter_name are required.' });
      }
      const membership = new Membership(req.body);
      const saved = await membership.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getallmemberships',authenticateCookie, async (req, res) => {
  try {
    const docs = await Membership.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
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
          role: 1,
          membership_status: 1,
          join_date: 1,
          renewal_date: 1,
          termination_date: 1,
          termination_reason: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, username: 1, name: 1, email: 1 },
          chapter: { _id: 1, chapter_name: 1, chapter_code: 1 }
        }
      }
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getmembershipbyid/:id',authenticateCookie, idValidation, handleValidationErrors, async (req, res) => {
  try {
    const [doc] = await Membership.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: 'chapters', localField: 'chapter_id', foreignField: '_id', as: 'chapter' }
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          role: 1,
          membership_status: 1,
          join_date: 1,
          renewal_date: 1,
          termination_date: 1,
          termination_reason: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, username: 1, name: 1, email: 1 },
          chapter: { _id: 1, chapter_name: 1, chapter_code: 1 }
        }
      }
    ]);
    if (!doc) return res.status(404).json({ message: 'Membership not found' });
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updatemembershipbyid/:id',
  authenticateCookie,
  updateMembershipValidation,
  handleValidationErrors,
  mapChapterNamesToIds,
  async (req, res) => {
    try {
      const updated = await Membership.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated)
        return res.status(404).json({ message: 'Membership not found' });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.delete('/deletemembershipbyid/:id',authenticateCookie, idValidation, handleValidationErrors, async (req, res) => {
  try {
    const deleted = await Membership.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Membership not found' });
    res.status(200).json({ message: 'Membership deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
