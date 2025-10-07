import express from 'express';
import mongoose from 'mongoose';
import { Attendance } from './MeetingsSchema.mjs';
import {
  idValidation,
  createAttendanceValidation,
  updateAttendanceValidation
} from './validator.mjs';
import { handleValidationErrors , authenticateCookie , mapNamesToIds } from '../middlewares.mjs';

const router = express.Router();

router.post(
  '/createattendance',
  createAttendanceValidation,
  handleValidationErrors,
  authenticateCookie , mapNamesToIds,
  async (req, res) => {
    try {
      if (!req.body.user_id)
        return res.status(400).json({ message: 'Valid username is required.' });
      const doc = new Attendance(req.body);
      const saved = await doc.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getallattendances', authenticateCookie ,async (req, res) => {
  try {
    const docs = await Attendance.aggregate([
      { $sort: { created_at: -1 } },
      { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'substitute_user_id', foreignField: '_id', as: 'substitute_user' } },
      { $unwind: { path: '$substitute_user', preserveNullAndEmptyArrays: true } },
      { $project: {
        attendance_status: 1,
        absence_reason: 1,
        notes: 1,
        created_at: 1,
        user: { _id: 1, username: 1, name: 1, email: 1 },
        substitute_user: { _id: 1, username: 1, name: 1, email: 1 }
      }}
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getattendancebyid/:id',authenticateCookie , idValidation, handleValidationErrors, async (req, res) => {
  try {
    const [doc] = await Attendance.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'substitute_user_id', foreignField: '_id', as: 'substitute_user' } },
      { $unwind: { path: '$substitute_user', preserveNullAndEmptyArrays: true } },
      { $project: {
        attendance_status: 1,
        absence_reason: 1,
        notes: 1,
        created_at: 1,
        user: { _id: 1, username: 1, name: 1, email: 1 },
        substitute_user: { _id: 1, username: 1, name: 1, email: 1 }
      }}
    ]);
    if (!doc) return res.status(404).json({ message: 'Attendance not found' });
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updateattendancebyid/:id',
  updateAttendanceValidation,
  handleValidationErrors,
  authenticateCookie , mapNamesToIds,
  async (req, res) => {
    try {
      const updated = await Attendance.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ message: 'Attendance not found' });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete('/deleteattendancebyid/:id', authenticateCookie ,idValidation, handleValidationErrors, async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Attendance not found' });
    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
