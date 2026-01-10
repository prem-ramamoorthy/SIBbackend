import express from 'express';
import mongoose from 'mongoose';
import { Membership, Chapter, User } from '../../schemas.mjs';
import { handleValidationErrors, mapNamesToIds } from '../../middlewares.mjs'
import {
  idValidation,
  createMembershipValidation,
  updateMembershipValidation
} from '../../validators.mjs';

const router = express.Router();

router.post(
  '/createmembership',
  createMembershipValidation,
  handleValidationErrors,
  mapNamesToIds,
  async (req, res) => {
    try {
      
      req.body.chapter_id = req.chapter._id;

      let newUserId = req.body.user_id;
      if (!newUserId && req.body.username) {
        const newUser = await User.findOne({ username: req.body.username });
        if (!newUser) {
          return res.status(404).json({ error: "Target user for membership not found." });
        }
        newUserId = newUser._id;
        req.body.user_id = newUserId;
      }

      if (!req.body.user_id || !req.body.chapter_id) {
        return res.status(400).json({ message: 'Both valid user_id and chapter_id are required.' });
      }

      const membership = new Membership(req.body);
      const saved = await membership.save();
      return res.status(201).json(saved);

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  '/createpresident',
  createMembershipValidation,
  handleValidationErrors,
  mapNamesToIds,
  async (req, res) => {
    try {
      let newUserId = req.body.user_id;
      if (!newUserId && req.body.username) {
        const newUser = await User.findOne({ username: req.body.username });
        if (!newUser) {
          return res.status(404).json({ error: "Target user for membership not found." });
        }
        newUserId = newUser._id;
        req.body.user_id = newUserId;
      }

      if (!req.body.user_id || !req.body.chapter_id) {
        return res.status(400).json({ message: 'Both valid user_id and chapter_id are required.' });
      }

      const membership = new Membership(req.body);
      const saved = await membership.save();
      return res.status(201).json(saved);

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getallmemberships', async (req, res) => {
  try {
    const docs = await Membership.aggregate([
      { $match: { chapter_id: req.chapter._id } },
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

router.get('/getmembershipbyid/:id', idValidation, handleValidationErrors, async (req, res) => {
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
  updateMembershipValidation,
  handleValidationErrors,
  mapNamesToIds,
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

router.delete('/deletemembershipbyid/:id', idValidation, handleValidationErrors, async (req, res) => {
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
