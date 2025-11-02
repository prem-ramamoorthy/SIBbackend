import express from 'express';
import { MemberProfile } from './ProfileSchema.mjs';
import User from '../../Auth/Schemas.mjs';
import mongoose from 'mongoose';
import {
  idValidation,
  createProfileValidation,
  updateProfileValidation,
  searchUserValidator
} from './validator.mjs';
import {
  authenticateCookie,
  handleValidationErrors,
  mapNamesToIds,
  mapverticalIds
} from '../middlewares.mjs';
import pageRouter from './profilepagereqiests.mjs';
import { Chapter, Membership } from '../chapter/ChapterSchema.mjs';
import { Vertical } from '../Admin/AdminSchemas.mjs';

const router = express.Router();
router.use(pageRouter);

router.get('/getallprofiles', authenticateCookie, async (req, res) => {
  try {
    const {
      region,
      chapter,
      vertical,
      sort,
      myChapterOnly
    } = req.query;

    const matchStage = {};

    if (region && region !== "All Regions") {
      matchStage["region.region_name"] = region;
    }
    if (chapter && chapter !== "All Chapters") {
      matchStage["chapter.chapter_name"] = chapter;
    }
    if (vertical && vertical !== "All Verticals") {
      matchStage["verticals.vertical_name"] = vertical;
    }
    
    const pipeline = [
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
        $lookup: {
          from: 'chapters',
          localField: 'chapter_id',
          foreignField: '_id',
          as: 'chapter'
        }
      },
      {
        $lookup: {
          from: 'regions',
          localField: 'region_id',
          foreignField: '_id',
          as: 'region'
        }
      },
      {
        $addFields: {
          chapter: { $ifNull: [ { $arrayElemAt: [ "$chapter.chapter_name", 0 ] }, null ] },
          region: { $ifNull: [ { $arrayElemAt: [ "$region.region_name", 0 ] }, null ] },
          verticals: { $ifNull: [ { $arrayElemAt: [ "$verticals.vertical_name", 0 ] }, null ] },
          user: {
            _id: "$user._id",
            username: "$user.username"
          }
        }
      },
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $project: {
          display_name: 1,
          profile_image_url: 1,
          company_phone: 1,
          company_email: 1,
          company_address: 1,
          blood_group: 1,
          vagai_category: 1,
          kulam_category: 1,
          native_place: 1,
          kuladeivam: 1,
          company_name: 1,
          user: 1,
          verticals: 1,
          chapter: 1,
          region: 1
        }
      }
    ];

    if (sort) {
      let sortConfig = {};
      if (sort === "Name A-Z") sortConfig = { display_name: 1 };
      else if (sort === "Name Z-A") sortConfig = { display_name: -1 };
      else if (sort === "Chapter") sortConfig = { chapter: 1 };
      else if (sort === "Region") sortConfig = { region: 1 };
      pipeline.unshift({ $sort: sortConfig });
    }

    const docs = await MemberProfile.aggregate(pipeline);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
        $lookup: {
          from: 'chapters',
          localField: 'chapter_id',
          foreignField: '_id',
          as: 'chapter'
        }
      },
      {
        $lookup: {
          from: 'regions',
          localField: 'region_id',
          foreignField: '_id',
          as: 'region'
        }
      },
      {
        $addFields: {
          chapter: { $ifNull: [ { $arrayElemAt: [ "$chapter.chapter_name", 0 ] }, null ] },
          region: { $ifNull: [ { $arrayElemAt: [ "$region.region_name", 0 ] }, null ] },
          verticals: { $ifNull: [ { $arrayElemAt: [ "$verticals.vertical_name", 0 ] }, null ] },
          user: {
            $cond: {
              if: { $isArray: ["$user"] },
              then: null,
              else: {
                _id: "$user._id",
                username: "$user.username"
              }
            }
          }
        }
      },
      {
        $project: {
          display_name: 1,
          profile_image_url: 1,
          company_phone: 1,
          company_email: 1,
          company_address: 1,
          blood_group: 1,
          vagai_category: 1,
          kulam_category: 1,
          native_place: 1,
          kuladeivam: 1,
          company_name: 1,
          user: 1,
          verticals: 1,
          chapter: 1,
          region: 1
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
          _id: 1,
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
          verticals: { vertical_name: 1 }
        }
      }
    ]);

    if (!doc) return res.status(200).json({ message: 'Profile not found' });

    if (doc.verticals) {
      doc.vertical_names = doc.verticals.map(v => v.vertical_name)
    } else {
      doc.vertical_names = [];
    }

    doc.chaptername = chapter ? chapter.chapter_name : null;

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getprofilebyid/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    const userId = req.query.user;

    if (!profileId || !userId) {
      return res.status(400).json({ error: 'Missing profile_id or user_id' });
    }

    if (!mongoose.Types.ObjectId.isValid(profileId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const userObj = await User.findById(userId);
    if (!userObj) {
      return res.status(404).json({ error: 'User not found with UID' });
    }

    const membership = await Membership.findOne({ user_id: userObj._id });
    if (!membership || !membership.chapter_id) {
      return res.status(404).json({ error: "Membership or chapter not found." });
    }

    const chapter = await Chapter.findById(membership.chapter_id);

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
          _id: 1,
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
          verticals: { vertical_name: 1 }
        }
      }
    ]);

    if (!doc) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (doc.verticals) {
      doc.vertical_names = doc.verticals.map(v => v.vertical_name)
    } else {
      doc.vertical_names = [];
    }

    doc.chaptername = chapter ? chapter.chapter_name : null;

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/updateprofile',
  updateProfileValidation,
  handleValidationErrors,
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
      console.log(err)
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

router.post(
  '/searchvertical',
  searchUserValidator,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { substr } = req.body;

      if (!substr || substr.trim() === "") {
        return res.status(400).json({ error: "Search substring required." });
      }

      const matchedChapters = await Vertical.find({
        vertical_name: { $regex: substr.trim(), $options: "i" }
      })
        .select("vertical_name")
        .limit(10);

      return res.status(200).json({
        results: matchedChapters.map(c => (c.vertical_name))
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error." });
    }
  }
);

export default router;
