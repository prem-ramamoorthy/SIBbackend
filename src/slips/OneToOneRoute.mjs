import express from 'express';
import mongoose from 'mongoose';
import { OneToOneMeeting } from './slipsSchema.mjs';
import {
  idValidation,
  createOneToOneMeetingValidation,
  updateOneToOneMeetingValidation
} from './validator.mjs';
import { mapNamesToIds, authenticateCookie, handleValidationErrors } from '../middlewares.mjs'
import User from '../../Auth/Schemas.mjs';
import { Membership } from '../chapter/ChapterSchema.mjs';

const router = express.Router();

router.post(
  '/createone2one',
  authenticateCookie,
  createOneToOneMeetingValidation,
  handleValidationErrors,
  mapNamesToIds,
  async (req, res) => {
    try {
      const user_id = req.user.uid;

      if (!user_id) {
        return res.status(400).json({ error: "Missing user id." });
      }

      const userObj = await User.findOne({ user_id });
      if (!userObj || !userObj._id) {
        return res.status(404).json({ error: "User not found with UID" });
      }

      req.body.member1_id = userObj._id;

      if (!req.body.member1_id || !req.body.member2_id || !req.body.chapter_id || !req.body.created_by)
        return res.status(400).json({ message: 'All member, chapter, and user references are required and must be valid.' });
      const meeting = new OneToOneMeeting(req.body);
      const saved = await meeting.save();
      res.status(201).json("One-to-One Meeting created successfully with ID: " + saved._id);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getone2ones', authenticateCookie, async (req, res) => {
  try {
    const firebaseUid = req.user && req.user.uid;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing user id." });
    }

    const user = await User.findOne({ user_id: firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userId = user._id;

    const userMembership = await Membership.findOne({
      user_id: userId,
      membership_status: true
    });
    if (!userMembership) {
      return res.status(404).json({ error: "Active membership not found for user." });
    }

    const chapterMemberships = await Membership.find({
      chapter_id: userMembership.chapter_id,
      membership_status: true
    }).select('user_id');

    const chapterUserIds = chapterMemberships.map(m => m.user_id);
    if (chapterUserIds.length === 0) {
      return res.status(200).json([]);
    }

    const docs = await OneToOneMeeting.aggregate([
      {
        $match: {
          chapter_id: userMembership.chapter_id,
          $or: [
            { member1_id: { $in: chapterUserIds } },
            { member2_id: { $in: chapterUserIds } }
          ]
        }
      },
      { $sort: { meeting_date: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'member1_id',
          foreignField: '_id',
          as: 'member1'
        }
      },
      { $unwind: { path: '$member1', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
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
      { $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          member1: {
            _id: 1,
            username: 1,
            email: 1
          },
          member2: {
            _id: 1,
            username: 1,
            email: 1
          },
          chapter: {
            _id: 1,
            chapter_name: 1,
            chapter_code: 1
          },
          created_by_user: {
            _id: 1,
            username: 1,
            email: 1
          },
          meeting_date: 1,
          location: 1,
          discussion_points: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    return res.status(200).json(docs);
  } catch (err) {
    console.error('Error in /getone2ones:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/getone2onebyid/:id', authenticateCookie, idValidation, handleValidationErrors, async (req, res) => {
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
  mapNamesToIds, authenticateCookie,
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

router.delete('/deleteone2onebyid/:id', authenticateCookie, idValidation, handleValidationErrors, async (req, res) => {
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