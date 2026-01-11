import router from "./CoordinatorRoute.mjs";
import RegionRouter from "./regions/regionRoute.mjs";
import VerticalRouter from './verticals/verticalRoute.mjs'
import express from 'express'
import { Chapter, Membership, OneToOneMeeting, Referral, TYFTB, Vertical, Region } from "../../schemas.mjs";

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

AdminRouter.get('/stats', async (_req, res) => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const tyftbTotal = await TYFTB.aggregate([
            {
                $group: {
                    _id: null,
                    totalBusinessAmount: { $sum: '$business_amount' }
                }
            }
        ]);
        const totalRevenue = parseInt(tyftbTotal[0]?.totalBusinessAmount ?? 0, 10);

        const referralCount = await Referral.countDocuments();

        const tyftbMonthly = await TYFTB.aggregate([
            {
                $match: {
                    createdAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalBusinessAmount: { $sum: '$business_amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const referralMonthly = await Referral.aggregate([
            {
                $match: {
                    createdAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const report = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const tyftb = tyftbMonthly.find(
                r => r._id.year === year && r._id.month === month
            );
            const referral = referralMonthly.find(
                r => r._id.year === year && r._id.month === month
            );

            report.push({
                month: `${monthNames[month - 1]} ${year}`,
                tyftbCount: tyftb ? tyftb.count : 0,
                referralCount: referral ? referral.count : 0,
                totalBusinessAmount: tyftb ? tyftb.totalBusinessAmount : 0
            });
        }

        res.status(200).json({
            referralCount,
            tyftbTotal: totalRevenue,
            last12MonthsReport: report
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get('/chapter-revenue', async (req, res) => {
    try {
    const chaptersRevenue = await TYFTB.aggregate([
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
            $lookup: {
                from: 'chapters',
                localField: 'payer.chapter_id',
                foreignField: '_id',
                as: 'chapter'
            }
        },
        { $unwind: '$chapter' },
        {
            $group: {
                _id: '$chapter._id',
                chapter_name: { $first: '$chapter.chapter_name' },
                total_business_amount: { $sum: '$business_amount' }
            }
        },
        {
            $project: {
                chapter_name: 1,
                total_business_amount: 1,
                _id: 0
            }
        }
    ]);
    res.status(200).json(chaptersRevenue);
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

export default AdminRouter;