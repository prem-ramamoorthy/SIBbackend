import express from 'express';
import { authenticateCookie } from '../middlewares.mjs';
import { Chapter, Membership, ChapterSummary } from '../chapter/ChapterSchema.mjs';
import User from '../../Auth/Schemas.mjs';
import { Meeting } from '../meetings/MeetingsSchema.mjs';
import { formatDate } from '../utils/dateformatter.mjs';
import { Event } from '../events/eventSchema.mjs';

const router = express.Router();

router.get('/getchapteroverview', authenticateCookie, async (req, res) => {
    try {
        const user_id = req.user.uid ;
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
    const user_id = req.user.uid ;
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

    const events = await Event.find({ chapter_id: membership.chapter_id })
      .sort({ event_date: 1 })
      .limit(2);

    if (!events || events.length === 0) {
      return res.status(200).json([]);
    }

    const response = events.map(event => ({
      companyName: event.organizer_company ?? "",
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
    const user_id = req.user.uid ;
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
      renewal_date : formatDate(membership.renewal_date)
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});


export default router;
