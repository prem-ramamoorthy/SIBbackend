import express from 'express';
import { MemberProfile } from './ProfileSchema.mjs';
import {
  idValidation,
  createProfileValidation,
  updateProfileValidation
} from './validator.mjs';
import {authenticateCookie , handleValidationErrors , mapNamesToIds } from '../middlewares.mjs'
import mongoose from 'mongoose';
import pageRouter from './profilepagereqiests.mjs'

const router = express.Router();
router.use(pageRouter)

router.post(
  '/createprofile',
  authenticateCookie,
  createProfileValidation,
  handleValidationErrors,
  mapNamesToIds,
  async (req, res) => {
    try {
      const doc = new MemberProfile(req.body);
      const saved = await doc.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/getallprofiles', authenticateCookie, async (req, res) => {
  try {
    const docs = await MemberProfile.aggregate([
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
          from: 'verticals',
          localField: 'vertical_id',
          foreignField: '_id',
          as: 'vertical'
        }
      },
      { $unwind: { path: '$vertical', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          display_name: 1,
          profile_image_url: 1,
          company_phone: 1,
          company_email: 1,
          company_address: 1,
          personal_address: 1,
          dob: 1,
          wedding_date: 1,
          blood_group: 1,
          vagai_category: 1,
          kulam_category: 1,
          native_place: 1,
          kuladeivam: 1,
          company_name: 1,
          gst_number: 1,
          years_in_business: 1,
          annual_turnover: 1,
          website: 1,
          services_offered: 1,
          ideal_referral: 1,
          gains_goals: 1,
          gains_accomplishments: 1,
          gains_interests: 1,
          gains_networks: 1,
          gains_skills: 1,
          elevator_pitch_30s: 1,
          why_sib: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, name: 1, email: 1 },
          vertical: { _id: 1, vertical_name: 1, vertical_code: 1 }
        }
      }
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getprofilebyid/:id',
  authenticateCookie,
  idValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const [doc] = await MemberProfile.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
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
            from: 'verticals',
            localField: 'vertical_id',
            foreignField: '_id',
            as: 'vertical'
          }
        },
        { $unwind: { path: '$vertical', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            display_name: 1,
            profile_image_url: 1,
            company_phone: 1,
            company_email: 1,
            company_address: 1,
            personal_address: 1,
            dob: 1,
            wedding_date: 1,
            blood_group: 1,
            vagai_category: 1,
            kulam_category: 1,
            native_place: 1,
            kuladeivam: 1,
            company_name: 1,
            gst_number: 1,
            years_in_business: 1,
            annual_turnover: 1,
            website: 1,
            services_offered: 1,
            ideal_referral: 1,
            gains_goals: 1,
            gains_accomplishments: 1,
            gains_interests: 1,
            gains_networks: 1,
            gains_skills: 1,
            elevator_pitch_30s: 1,
            why_sib: 1,
            createdAt: 1,
            updatedAt: 1,
            user: { _id: 1, name: 1, email: 1 },
            vertical: { _id: 1, vertical_name: 1, vertical_code: 1 }
          }
        }
      ]);
      if (!doc) return res.status(404).json({ message: 'Profile not found' });
      res.status(200).json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  '/updateprofilebyid/:id',
  idValidation,
  updateProfileValidation,
  handleValidationErrors,
  mapNamesToIds,
  async (req, res) => {
    try {
      const updated = await MemberProfile.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated)
        return res.status(404).json({ message: 'Profile not found' });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete('/deleteprofilebyid/:id', authenticateCookie, idValidation, handleValidationErrors, async (req, res) => {
  try {
    const deleted = await MemberProfile.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
