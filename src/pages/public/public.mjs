import express from 'express';
import { MemberProfile, Vertical, Chapter, Region, Referral, Membership, TYFTB } from '../../schemas.mjs';

const Public = express.Router();

Public.get('/getallprofiles', async (req, res) => {
  try {
    const { region, chapter, vertical, sort, search } = req.query;

    const pipeline = [];

    pipeline.push(
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
        $lookup: {
          from: 'regions',
          localField: 'region_id',
          foreignField: '_id',
          as: 'region'
        }
      },
      { $unwind: { path: '$region', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'verticals',
          localField: 'vertical_ids',
          foreignField: '_id',
          as: 'verticals'
        }
      }
    );

    pipeline.push({
      $addFields: {
        chapter_name: '$chapter.chapter_name',
        region_name: '$region.region_name',
        vertical_names: {
          $map: { input: "$verticals", as: "v", in: "$$v.vertical_name" }
        },
        username: '$user.username'
      }
    });

    const matchStage = {};

    if (region && region !== "All Regions") {
      matchStage.region_name = { $regex: `^${region}$`, $options: 'i' };
    }

    if (chapter && chapter !== "All Chapters") {
      matchStage.chapter_name = { $regex: `^${chapter}$`, $options: 'i' };
    }

    if (vertical && vertical !== "All Verticals") {
      matchStage.vertical_names = { $regex: `^${vertical}$`, $options: 'i' };
    }

    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      matchStage.$or = [
        { display_name: searchRegex },
        { username: searchRegex },
        { company_name: searchRegex },
        { company_email: searchRegex },
        { native_place: searchRegex },
        { chapter_name: searchRegex },
        { region_name: searchRegex },
        { vertical_names: searchRegex } // This line ensures vertical_names is searched
      ];
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    let sortConfig = { createdAt: -1 };

    if (sort === "Name A-Z") {
      sortConfig = { username: 1 };
    } else if (sort === "Name Z-A") {
      sortConfig = { username: -1 };
    } else if (sort === "Chapter") {
      sortConfig = { chapter_name: 1, username: 1 };
    } else if (sort === "Region") {
      sortConfig = { region_name: 1, username: 1 };
    }

    pipeline.push({ $sort: sortConfig });

    pipeline.push({
      $project: {
        _id: 1,
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
        user: {
          _id: "$user._id",
          username: "$username"
        },
        verticals: "$vertical_names",
        chapter: "$chapter_name",
        region: "$region_name",
        createdAt: 1
      }
    });

    const docs = await MemberProfile.aggregate(pipeline);

    res.status(200).json(docs);
  } catch (err) {
    console.error('Error in /getallprofiles:', err);
    res.status(500).json({ error: err.message });
  }
});

Public.get('/getallverticals', async (req, res) => {
  try {
    const verticals = await Vertical.find().sort({ created_at: -1 }).select("vertical_name");
    const verticalNames = verticals.map(v => v.vertical_name);
    res.status(200).json(verticalNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

Public.get('/getallchapternames', async (req, res) => {
  try {
    const chapters = await Chapter.find().sort({ founded_date: -1 }).select('chapter_name');
    const chapterNames = chapters.map(ch => ch.chapter_name);
    res.status(200).json(chapterNames);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

Public.get('/getallregions', async (req, res) => {
  try {
    const regions = await Region.find().sort({ created_at: -1 }).select('region_name');
    const regionNames = regions.map(r => r.region_name);
    res.status(200).json(regionNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

Public.get('/stats', async (req, res) => {
  try {
    const verticalcount = await Vertical.countDocuments();
    const referralcount = await Referral.countDocuments();
    const membershipcount = await Membership.countDocuments();
    const chaptercount = await Chapter.countDocuments();
    const results = await TYFTB.aggregate(
      [
        {
          $match: {
            status: true
          }
        },
        {
          $group: {
            _id: null,
            totalBusinessAmount: {
              $sum: '$business_amount'
            }
          }
        }
      ]);
    const totalRevenue = parseInt(results[0]?.totalBusinessAmount ?? 0, 10);
    res.status(200).json({ verticalcount, referralcount, membershipcount, chaptercount, bussinessamount: totalRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default Public;