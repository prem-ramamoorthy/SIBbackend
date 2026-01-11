import router from "./CoordinatorRoute.mjs";
import RegionRouter from "./regions/regionRoute.mjs";
import VerticalRouter from './verticals/verticalRoute.mjs'
import express from 'express'
import { Chapter, Membership, OneToOneMeeting, Referral, TYFTB } from "../../schemas.mjs";

const AdminRouter = express.Router();

AdminRouter.use('/region', RegionRouter)
AdminRouter.use('/vertical', VerticalRouter)
AdminRouter.use('/coordinator', router)

AdminRouter.get('/chapter-performance', async (req, res) => {
    try {
        const time = req.query.time || 'all_time'; // 'month', 'week', 'year'
        let dateFilter = {};

        if (time === 'year') {
            const lastYear = new Date();
            lastYear.setFullYear(lastYear.getFullYear() - 1);
            dateFilter = { $gte: lastYear };
        } else if (time === 'month') {
            const lastMonth = new Date();
            lastMonth.setDate(lastMonth.getDate() - 30);
            dateFilter = { $gte: lastMonth };
        } else if (time === 'week') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            dateFilter = { $gte: lastWeek };
        }

        const addDateMatch = (pipeline, dateField) => {
            if (time !== 'all_time') {
                pipeline.unshift({ $match: { [dateField]: dateFilter } });
            }
            return pipeline;
        };

        const [chapters, members, referrals, m2ms, tyftbs] = await Promise.all([
            Chapter.aggregate([
                {
                    $lookup: {
                        from: 'regions',
                        localField: 'region_id',
                        foreignField: '_id',
                        as: 'region'
                    }
                },
                { $unwind: '$region' },
                {
                    $project: {
                        chapter_name: 1,
                        'region.region_name': 1
                    }
                }
            ]),
            Membership.aggregate([
                {
                    $group: {
                        _id: '$chapter_id',
                        total_members: { $sum: 1 }
                    }
                }
            ]),
            Referral.aggregate(
                addDateMatch([
                    {
                        $lookup: {
                            from: 'chapter_memberships',
                            localField: 'referrer_id',
                            foreignField: 'user_id',
                            as: 'referrer'
                        }
                    },
                    { $unwind: '$referrer' },
                    {
                        $group: {
                            _id: '$referrer.chapter_id',
                            total_referrals: { $sum: 1 }
                        }
                    }
                ], 'createdAt')
            ),
            OneToOneMeeting.aggregate(
                addDateMatch([
                    {
                        $lookup: {
                            from: 'chapter_memberships',
                            localField: 'member1_id',
                            foreignField: 'user_id',
                            as: 'member'
                        }
                    },
                    { $unwind: '$member' },
                    {
                        $group: {
                            _id: '$member.chapter_id',
                            total_m2m: { $sum: 1 }
                        }
                    }
                ], 'createdAt')
            ),
            TYFTB.aggregate(
                addDateMatch([
                    {
                        $lookup: {
                            from: 'chapter_memberships',
                            localField: 'payer_id',
                            foreignField: 'user_id',
                            as: 'payer'
                        }
                    },
                    { $unwind: '$payer' },
                    {
                        $group: {
                            _id: '$payer.chapter_id',
                            total_business_amount: { $sum: '$business_amount' }
                        }
                    }
                ], 'createdAt')
            )
        ]);
        res.status(200).json({ chapters, members, referrals, m2ms, tyftbs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default AdminRouter;