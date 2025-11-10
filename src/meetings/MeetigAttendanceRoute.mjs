import express from 'express';
import mongoose from 'mongoose';
import { Attendance } from './MeetingsSchema.mjs';
import {
  idValidation,
  createAttendanceValidation,
  updateAttendanceValidation
} from './validator.mjs';
import { handleValidationErrors, authenticateCookie, mapNamesToIds } from '../middlewares.mjs';
import User from '../../Auth/Schemas.mjs';
import { Membership } from '../chapter/ChapterSchema.mjs';

const router = express.Router();

router.post(
  '/createattendance',
  createAttendanceValidation,
  handleValidationErrors,
  authenticateCookie,
  mapNamesToIds,
  async (req, res) => {
    try {
      if (!req.body.user_id) {
        return res.status(400).json({ error: 'Valid user_id is required.' });
      }
      if (!req.body.meeting_id) {
        return res.status(400).json({ error: 'Valid meeting_id is required.' });
      }
      req.body.meeting_id = new mongoose.Types.ObjectId(req.body.meeting_id);
      req.body.user_id = new mongoose.Types.ObjectId(req.body.user_id);
      const doc = new Attendance(req.body);
      const saved = await doc.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getallattendances', authenticateCookie, async (req, res) => {
  try {
    const userId = req.user && req.user.uid;
    if (!userId) {
      return res.status(400).json({ error: "Missing user id." });
    }

    const userObj = await User.findOne({ user_id: userId });
    if (!userObj) {
      return res.status(404).json({ error: "User not found." });
    }

    const membership = await Membership.findOne({
      user_id: userObj._id,
      membership_status: true
    });
    if (!membership) {
      return res.status(404).json({ error: "Membership not found." });
    }

    const allMemberships = await Membership.find({
      chapter_id: membership.chapter_id,
      membership_status: true
    }).select('user_id');

    const chapterUserIds = allMemberships.map(m => m.user_id);

    if (!chapterUserIds.length) {
      return res.status(200).json([]);
    }

    const docs = await Attendance.aggregate([
      { $match: { user_id: { $in: chapterUserIds } } },
      { $sort: { created_at: -1 } },
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
          from: 'meetings',
          localField: 'meeting_id',
          foreignField: '_id',
          as: 'meeting'
        }
      },
      { $unwind: { path: '$meeting', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          attendance_status: 1,
          date: 1,
          user: { _id: 1, username: 1, email: 1, phone_number: 1 },
          meeting: { _id: 1, meeting_date: 1, title: 1, location: 1 }
        }
      }
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getattendancebyid/:id',
  authenticateCookie,
  idValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user && req.user.uid;
      if (!userId) {
        return res.status(400).json({ error: "Missing user id." });
      }

      const userObj = await User.findOne({ user_id: userId });
      if (!userObj) {
        return res.status(404).json({ error: "User not found." });
      }

      const membership = await Membership.findOne({
        user_id: userObj._id,
        membership_status: true
      });
      if (!membership) {
        return res.status(404).json({ error: "Membership not found." });
      }

      const allMemberships = await Membership.find({
        chapter_id: membership.chapter_id,
        membership_status: true
      }).select("user_id");

      const chapterUserIds = allMemberships.map(m => m.user_id);

      const [doc] = await Attendance.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
            user_id: { $in: chapterUserIds }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "meetings",
            localField: "meeting_id",
            foreignField: "_id",
            as: "meeting"
          }
        },
        { $unwind: { path: "$meeting", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            attendance_status: 1,
            date: 1,
            user: { _id: 1, username: 1, email: 1, phone_number: 1 },
            meeting: { _id: 1, meeting_date: 1, title: 1, location: 1 }
          }
        }
      ]);
      if (!doc) {
        return res.status(404).json({ error: 'Attendance record not found or not accessible' });
      }
      res.status(200).json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getattendanceofuser/:userid', authenticateCookie, async (req, res) => {
  try {
    const requesterUserId = req.user && req.user.uid;
    if (!requesterUserId) {
      return res.status(400).json({ error: 'Missing user id.' });
    }

    const requester = await User.findOne({ user_id: requesterUserId }).lean();
    if (!requester?._id) {
      return res.status(404).json({ error: 'Requester not found.' });
    }

    const membership = await Membership.findOne({
      user_id: requester._id,
      membership_status: true
    });
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found.' });
    }

    const allMemberships = await Membership.find({
      chapter_id: membership.chapter_id,
      membership_status: true
    }).select('user_id');
    const chapterUserIds = allMemberships.map(m => m.user_id.toString());

    const { userid } = req.params;
    let targetUserObj;
    if (mongoose.Types.ObjectId.isValid(userid)) {
      targetUserObj = await User.findById(userid).lean();
    } else {
      targetUserObj = await User.findOne({ user_id: userid }).lean();
    }
    if (!targetUserObj?._id) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (!chapterUserIds.includes(targetUserObj._id.toString())) {
      return res.status(403).json({ error: 'User not in the same chapter.' });
    }

    const docs = await Attendance.aggregate([
      { $match: { user_id: targetUserObj._id } },
      { $sort: { date: -1 } },
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
          from: 'meetings',
          localField: 'meeting_id',
          foreignField: '_id',
          as: 'meeting'
        }
      },
      { $unwind: { path: '$meeting', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          attendance_status: 1,
          date: 1,
          user: { _id: 1, username: 1, email: 1, phone_number: 1 },
          meeting: { _id: 1, meeting_date: 1, title: 1, location: 1 }
        }
      }
    ]);

    if (!docs || docs.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updateattendancebyid/:id',
  updateAttendanceValidation,
  handleValidationErrors,
  authenticateCookie,
  mapNamesToIds,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid attendance ID' });
      }

      if (req.body.meeting_id && typeof req.body.meeting_id === 'string') {
        req.body.meeting_id = new mongoose.Types.ObjectId(req.body.meeting_id);
      }
      if (req.body.user_id && typeof req.body.user_id === 'string') {
        req.body.user_id = new mongoose.Types.ObjectId(req.body.user_id);
      }

      const updated = await Attendance.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  '/deleteattendancebyid/:id',
  authenticateCookie,
  idValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid attendance ID' });
      }

      const deleted = await Attendance.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      res.status(200).json({ message: 'Attendance deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
