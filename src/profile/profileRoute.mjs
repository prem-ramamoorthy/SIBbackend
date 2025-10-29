import express from 'express';
import { MemberProfile } from './ProfileSchema.mjs';
import User from '../../Auth/Schemas.mjs';
import {
  idValidation,
  createProfileValidation,
  updateProfileValidation
} from './validator.mjs';
import {
  authenticateCookie,
  handleValidationErrors,
  mapNamesToIds,
  mapverticalIds
} from '../middlewares.mjs';
import pageRouter from './profilepagereqiests.mjs';
import { Chapter,Membership } from '../chapter/ChapterSchema.mjs';

const router = express.Router();
router.use(pageRouter);

router.post(
  '/createprofile',
  authenticateCookie,
  mapNamesToIds,
  createProfileValidation,
  handleValidationErrors,
  mapverticalIds,
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
      req.body.user_id = userObj._id;
      if (req.body.vertical_ids && !Array.isArray(req.body.vertical_ids)) {
        req.body.vertical_ids = [req.body.vertical_ids];
      }
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
          localField: 'vertical_ids',
          foreignField: '_id',
          as: 'verticals'
        }
      },
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
          years_in_business: 1,
          annual_turnover: 1,
          website: 1,
          services: 1,
          ideal_referral: 1,
          bio: 1,
          elevator_pitch_30s: 1,
          why_sib: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, name: 1, email: 1 },
          verticals: { _id: 1, vertical_name: 1, vertical_code: 1 }
        }
      }
    ]);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getprofile', authenticateCookie, async (req, res) => {
  try {
    const user_id = req.user?.uid;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user id.' });
    }
    const userObj = await User.findOne({ user_id });
    if (!userObj || !userObj._id) {
      return res.status(404).json({ error: 'User not found with UID' });
    }

    const membership = await Membership.findOne({ user_id: userObj._id });
    if (!membership || !membership.chapter_id) {
      return res.status(404).json({ error: "Membership or chapter not found." });
    }

    const chapter = await Chapter.findById(membership.chapter_id);

    const [doc] = await MemberProfile.aggregate([
      { $match: { user_id: userObj._id } },
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
          localField: 'vertical_ids',
          foreignField: '_id',
          as: 'verticals'
        }
      },
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
          years_in_business: 1,
          annual_turnover: 1,
          website: 1,
          services: 1,
          ideal_referral: 1,
          bio: 1,
          elevator_pitch_30s: 1,
          why_sib: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, name: 1, email: 1, username: 1 },
          verticals: { _id: 1, vertical_name: 1, vertical_code: 1 }
        }
      }
    ]);

    if (!doc) return res.status(404).json({ message: 'Profile not found' });

    doc.chaptername = chapter ? chapter.chapter_name : null;

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getprofilebyid/:id', authenticateCookie, async (req, res) => {
  try {
    const profileId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID format' });
    }

    const [doc] = await MemberProfile.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(profileId) } },

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
          localField: 'vertical_ids',
          foreignField: '_id',
          as: 'verticals'
        }
      },

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
          years_in_business: 1,
          annual_turnover: 1,
          website: 1,
          services: 1,
          ideal_referral: 1,
          bio: 1,
          elevator_pitch_30s: 1,
          why_sib: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, name: 1, email: 1 },
          verticals: { _id: 1, vertical_name: 1, vertical_code: 1 }
        }
      }
    ]);

    if (!doc) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updateprofile',
  updateProfileValidation,
  authenticateCookie,
  mapNamesToIds,
  mapverticalIds,
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

      const userProfile = await MemberProfile.findOne({ user_id: userObj._id });

      if (!userProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      if (req.body.vertical_ids && !Array.isArray(req.body.vertical_ids)) {
        req.body.vertical_ids = [req.body.vertical_ids];
      }
      const updated = await MemberProfile.findByIdAndUpdate(
        userProfile._id,
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

router.delete(
  '/deleteprofilebyid/:id',
  authenticateCookie,
  idValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const deleted = await MemberProfile.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: 'Profile not found' });
      res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
