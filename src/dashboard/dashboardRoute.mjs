import express from 'express';
import { authenticateCookie, handleValidationErrors } from '../middlewares.mjs';
import { Chapter, Membership, ChapterSummary } from '../chapter/ChapterSchema.mjs';
import User from '../../Auth/Schemas.mjs';
import { Meeting } from '../meetings/MeetingsSchema.mjs';
import { formatDate } from '../utils/dateformatter.mjs';
import { Event } from '../events/eventSchema.mjs';
import { Referral, TYFTB, OneToOneMeeting, Visitor } from '../slips/slipsSchema.mjs';
import { searchUserValidator } from './validator.mjs';

const router = express.Router();

router.get('/getchapteroverview', authenticateCookie, async (req, res) => {
	try {
		const user_id = req.user.uid;
		if (!user_id) {
			return res.status(400).json({ error: "Missing user id." });
		}

		const userObj = await User.findOne({ user_id });
		if (!userObj || !userObj._id) {
			return res.status(404).json({ error: "User not found with UID" });
		}

		const membership = await Membership.findOne({ user_id: userObj._id });
		if (!membership || !membership.chapter_id) {
			return res.status(404).json({ error: "Membership or chapter not found." });
		}

		const chapter = await Chapter.findById(membership.chapter_id);
		if (!chapter) {
			return res.status(404).json({ error: "Chapter not found." });
		}

		const meeting = await Meeting.findOne({
			chapter_id: membership.chapter_id,
			meeting_status: false,
		}).sort({ meeting_date: 1 });

		const summary = await ChapterSummary.findOne({ chapter_id: membership.chapter_id });

		res.status(200).json({
			chapterName: chapter.chapter_name ?? "",
			nextMeeting: meeting?.meeting_date ? formatDate(meeting.meeting_date) : "No upcoming meeting",
			totalMembers: chapter.current_member_count ?? 0,
			totalRevenue: summary?.total_business ?? 0,
			totalvisitors: summary?.visitors_total ?? 0,
		});
	} catch (err) {
		res.status(500).json({ error: "Internal server error." });
	}
});

router.get('/getupcomingevents', authenticateCookie, async (req, res) => {
	try {
		const user_id = req.user.uid;
		if (!user_id) {
			return res.status(400).json({ error: "Missing user id." });
		}

		const userObj = await User.findOne({ user_id });
		if (!userObj || !userObj._id) {
			return res.status(404).json({ error: "User not found with UID." });
		}

		const membership = await Membership.findOne({ user_id: userObj._id });
		if (!membership || !membership.chapter_id) {
			return res.status(404).json({ error: "Membership or chapter not found." });
		}

		const events = await Event.find({
			chapter_id: membership.chapter_id,
			event_date: { $gte: new Date() },
			event_status: "upcoming"
		})
			.sort({ event_date: 1 })
			.limit(1);

		if (!events || events.length === 0) {
			return res.status(200).json([]);
		}

		const response = events.map(event => ({
			companyName: event.event_title ?? "",
			date: event.event_date ? formatDate(event.event_date) : "No upcoming event",
			time: event.event_time ?? "",
			VATnumber: event.vat_number ?? "",
		}));

		res.status(200).json(response);
	} catch (err) {
		res.status(500).json({ error: "Internal server error." });
	}
});

router.get('/getrenewaldate', authenticateCookie, async (req, res) => {
	try {
		const user_id = req.user.uid;
		if (!user_id) {
			return res.status(400).json({ error: "Missing user id." });
		}

		const userObj = await User.findOne({ user_id });
		if (!userObj || !userObj._id) {
			return res.status(404).json({ error: "User not found with UID." });
		}

		const membership = await Membership.findOne({ user_id: userObj._id });
		if (!membership || !membership.renewal_date) {
			return res.status(404).json({ error: "Renewal Date Not found" });
		}

		res.status(200).json({
			renewal_date: formatDate(membership.renewal_date)
		});
	} catch (err) {
		res.status(500).json({ error: "Internal server error." });
	}
});

router.get('/getactivity', authenticateCookie, async (req, res) => {
	try {
		const userId = req.user && req.user.uid;
		if (!userId) {
			return res.status(400).json({ error: "Missing user id." });
		}
		const userObj = await User.findOne({ user_id: userId });
		const referral_given = await Referral.countDocuments({ referrer_id: userObj._id });
		const referral_received = await Referral.countDocuments({ referee_id: userObj._id });
		const tyftb_given = await TYFTB.countDocuments({ payer_id: userObj._id });
		const tyftb_received = await TYFTB.countDocuments({ receiver_id: userObj._id });
		const M2Ms = await OneToOneMeeting.countDocuments({
			$or: [
				{ member1_id: userObj._id },
				{ member2_id: userObj._id }
			]
		});
		const Visitors = await Visitor.countDocuments({ inviting_member_id: userObj._id });
		const result = await TYFTB.aggregate([
			{ $match: { receiver_id: userObj._id } },
			{ $group: { _id: null, totalBusiness: { $sum: "$business_amount" } } }
		]);

		const business_made = result[0]?.totalBusiness || 0;
		return res.status(200).json({ referral_given, referral_received, tyftb_given, tyftb_received, business_made, M2Ms, Visitors });
	} catch (err) {
		console.error('Error fetching activity:', err);
		return res.status(500).json({ error: "Internal server error." });
	}
});

router.get('/weekstats', authenticateCookie, async (req, res) => {
	try {
		const userId = req.user?.uid;
		if (!userId) {
			return res.status(400).json({ error: "Missing user id." });
		}

		const userObj = await User.findOne({ user_id: userId });
		if (!userObj) {
			return res.status(404).json({ error: "User not found." });
		}

		const referral_given = await Referral.aggregate([
			{
				$match: {
					referrer_id: userObj._id
				}
			},
			{
				$group: {
					_id: {
						week: { $week: "$created_at" },
						year: { $year: "$created_at" }
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { "_id.year": 1, "_id.week": 1 } }
		]);

		const tyftb_given = await TYFTB.aggregate([
			{
				$match: {
					payer_id: userObj._id
				}
			},
			{
				$group: {
					_id: {
						week: { $week: "$created_at" },
						year: { $year: "$created_at" }
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { "_id.year": 1, "_id.week": 1 } }
		]);

		const M2M = await OneToOneMeeting.aggregate([
			{
				$match: {
					$or: [
						{ member1_id: userObj._id },
						{ member2_id: userObj._id }
					]
				}
			},
			{
				$group: {
					_id: {
						week: { $week: "$meeting_date" },
						year: { $year: "$meeting_date" }
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { "_id.year": 1, "_id.week": 1 } }
		]);

		const visitors = await Visitor.aggregate([
			{
				$match: {
					inviting_member_id: userObj._id
				}
			},
			{
				$group: {
					_id: {
						week: { $week: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { "_id.year": 1, "_id.week": 1 } }
		]);

		res.json({ referral_given, tyftb_given, M2M, visitors });

	} catch (error) {
		console.error("Week Stats Error:", error);
		res.status(500).json({ error: "Could not fetch week stats." });
	}
});

router.post(
	'/searchuser',
	authenticateCookie,
	searchUserValidator,
	handleValidationErrors,
	async (req, res) => {
		try {
			const { substr } = req.body;
			const userUid = req.user?.uid;

			if (!userUid) {
				return res.status(400).json({ error: "Missing user id." });
			}

			if (!substr || substr.trim() === "") {
				return res.status(400).json({ error: "Search substring required." });
			}

			const userObj = await User.findOne({ user_id: userUid });
			if (!userObj) {
				return res.status(404).json({ error: "User not found." });
			}

			const membership = await Membership.findOne({ user_id: userObj._id });
			if (!membership?.chapter_id) {
				return res.status(404).json({ error: "Membership or chapter not found." });
			}

			const sameChapterMemberships = await Membership.find({
				chapter_id: membership.chapter_id,
			}).select("user_id");

			const memberIds = sameChapterMemberships.map(m => m.user_id);

			const matchedUsers = await User.find({
				_id: { $in: memberIds },
				username: { $regex: substr.trim(), $options: "i" },
				_id: { $ne: userObj._id }
			})
				.select("username")
				.limit(10);

			return res.status(200).json({
				results: matchedUsers.map(u => (u.username))
			});
		} catch (error) {
			console.error("SearchUser Error:", error);
			return res.status(500).json({ error: "Internal Server Error." });
		}
	}
);

router.post(
	'/searchchapter',
	authenticateCookie,
	searchUserValidator,
	handleValidationErrors,
	async (req, res) => {
		try {
			const { substr } = req.body;

			if (!substr || substr.trim() === "") {
				return res.status(400).json({ error: "Search substring required." });
			}

			const matchedChapters = await Chapter.find({
				chapter_name: { $regex: substr.trim(), $options: "i" }
			})
				.select("chapter_name")
				.limit(10);

			return res.status(200).json({
				results: matchedChapters.map(c => (c.chapter_name))
			});
		} catch (error) {
			return res.status(500).json({ error: "Internal Server Error." });
		}
	}
);

router.get('/getactivity/:timeline', authenticateCookie, async (req, res) => {
	const timeline = String(req.params.timeline || 'full').toLowerCase(); // "full" | "6months" | "amonth"
	try {
		const userId = req.user && req.user.uid;
		if (!userId) {
			return res.status(400).json({ error: "Missing user id." });
		}

		const userObj = await User.findOne({ user_id: userId }).lean();

		if (!userObj?._id) {
			return res.status(404).json({ error: "User not found." });
		}

		const now = new Date();
		let startDate = null;
		let endDate = now;

		if (timeline === 'amonth') {
			startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 1);
		} else if (timeline === '6months') {
			startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 6);
		} else if (timeline === 'full') {
			startDate = null;
			endDate = null;
		}

		const rangeFilter = startDate && endDate
			? { createdAt: { $gte: startDate, $lte: endDate } }
			: {};

		const referralGivenFilter = { referrer_id: userObj._id, ...rangeFilter };
		const referralReceivedFilter = { referee_id: userObj._id, ...rangeFilter };
		const tyftbGivenFilter = { payer_id: userObj._id, ...rangeFilter };
		const tyftbReceivedFilter = { receiver_id: userObj._id, ...rangeFilter };
		const m2mFilter = {
			$or: [{ member1_id: userObj._id }, { member2_id: userObj._id }],
			...rangeFilter
		};
		const visitorsFilter = { inviting_member_id: userObj._id, ...rangeFilter };

		const [
			referral_given,
			referral_received,
			tyftb_given,
			tyftb_received,
			M2Ms,
			Visitors,
			businessAgg
		] = await Promise.all([
			Referral.countDocuments(referralGivenFilter),
			Referral.countDocuments(referralReceivedFilter),
			TYFTB.countDocuments(tyftbGivenFilter),
			TYFTB.countDocuments(tyftbReceivedFilter),
			OneToOneMeeting.countDocuments(m2mFilter),
			Visitor.countDocuments(visitorsFilter),
			TYFTB.aggregate([
				{ $match: { receiver_id: userObj._id, ...(rangeFilter.createdAt ? rangeFilter : {}) } },
				{ $group: { _id: null, totalBusiness: { $sum: "$business_amount" } } }
			])
		]);

		const business_made = (businessAgg[0]?.totalBusiness) || 0;

		return res.status(200).json({
			timeline,
			date_range: startDate && endDate ? { start: startDate, end: endDate } : null,
			referral_given,
			referral_received,
			tyftb_given,
			tyftb_received,
			business_made,
			M2Ms,
			Visitors
		});
	} catch (err) {
		console.error('Error fetching activity:', err);
		return res.status(500).json({ error: "Internal server error." });
	}
});

router.get('/caneditevents', authenticateCookie, async (req, res) => {
	try {
		const userId = req.user && req.user.uid;
		if (!userId) {
			return res.status(400).json({ error: "Missing user id." });
		}

		const userObj = await User.findOne({ user_id: userId }).lean();

		if (!userObj?._id) {
			return res.status(404).json({ error: "User not found." });
		}
		const membership = await Membership.findOne({ user_id: userObj._id });
		if (!membership || !membership.chapter_id) {
			return res.status(404).json({ error: "Membership or chapter not found." });
		}
		if(membership.role === "president" || membership.role === "admin"){
			res.status(200).json({ hasaccess: true });
		}
		else{
			res.status(200).json({ hasaccess: false });
		}
	} catch (err) {
		console.error('Error fetching event access key', err);
		return res.status(500).json({ error: "Internal server error." });
	}
});

export default router;