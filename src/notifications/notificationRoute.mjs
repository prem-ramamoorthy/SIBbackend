import express from "express";
import { Notification } from "./NotificationSchema.mjs";
import {
    createNotificationValidation,
    getNotificationsValidation,
    createbulkNotificationValidation,
    getNotificationByIdValidation,
    updateNotificationValidation,
    deleteNotificationValidation
} from "./validators.mjs";
import {
    handleValidationErrors,
    mapNamesToIds,
    authenticateCookie
} from "../middlewares.mjs";
import mongoose from "mongoose";
import User from "../../Auth/Schemas.mjs";
import { Membership, Chapter } from "../chapter/ChapterSchema.mjs";

const router = express.Router();

import { body } from "express-validator";
const assertBodyObjectIds = [
    body("receiver").custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage("receiver must be ObjectId"),
    body("sender").optional().custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage("sender must be ObjectId"),
];

router.post(
    "/createnotification",
    authenticateCookie,
    createNotificationValidation,
    handleValidationErrors,
    mapNamesToIds,
    assertBodyObjectIds,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { receiver, sender, header, content, read, readAt } = req.body;
            const notif = new Notification({ receiver, sender, header, content, read, readAt });
            await notif.save();
            res.status(201).json(notif);
        } catch (err) {
            res.status(400).json({ error: err.message || "Failed to create notification" });
        }
    }
);

router.get(
    "/getallnotifications",
    authenticateCookie,
    getNotificationsValidation,
    (req, _res, next) => {
        if (typeof req.query.read === "string") {
            req.query.read = req.query.read === "true";
        }
        next();
    },
    handleValidationErrors,
    async (req, res) => {
        try {
            const { read } = req.query;
            const filter = {};
            const userId = req.user && req.user.uid;
            if (!userId) {
                return res.status(400).json({ error: "Missing user id." });
            }
            const userObj = await User.findOne({ user_id: userId }).lean();
            if (!userObj?._id) {
                return res.status(404).json({ error: "User not found." });
            }
            filter.receiver = userObj._id;
            if (read !== undefined) filter.read = read;
            const notifications = await Notification.find(filter).sort({ createdAt: -1 });
            res.json(notifications);
        } catch (err) {
            res.status(500).json({ error: err.message || "Failed to fetch notifications" });
        }
    }
);

router.get(
    "/getnotificationbyid/:id",
    authenticateCookie,
    getNotificationByIdValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const notif = await Notification.findById(req.params.id);
            if (!notif) return res.status(404).json({ error: "Notification not found" });
            res.json(notif);
        } catch (err) {
            res.status(500).json({ error: err.message || "Failed to get notification" });
        }
    }
);

router.patch(
    "/updatenotificationbyid/:id",
    authenticateCookie,
    updateNotificationValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const updateFields = {};
            const allowed = ["header", "content", "read", "readAt"];
            allowed.forEach((k) => {
                if (k in req.body) updateFields[k] = req.body[k];
            });
            const notif = await Notification.findByIdAndUpdate(
                req.params.id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );
            if (!notif) return res.status(404).json({ error: "Notification not found" });
            res.json(notif);
        } catch (err) {
            res.status(400).json({ error: err.message || "Failed to update notification" });
        }
    }
);

router.delete(
    "/deletenotificationbyid/:id",
    authenticateCookie,
    deleteNotificationValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const notif = await Notification.findByIdAndDelete(req.params.id);
            if (!notif) return res.status(404).json({ error: "Notification not found" });
            res.json({ success: true, deleted: notif });
        } catch (err) {
            res.status(500).json({ error: err.message || "Failed to delete notification" });
        }
    }
);

router.patch(
    "/readallnotifications",
    authenticateCookie,
    handleValidationErrors,
    async (req, res) => {
        try {
            const userId = req.user && req.user.uid;
            if (!userId) {
                return res.status(400).json({ error: "Missing user id." });
            }

            const userObj = await User.findOne({ user_id: userId }).lean();
            if (!userObj?._id) {
                return res.status(404).json({ error: "User not found." });
            }

            const filter = { receiver: userObj._id, read: { $ne: true } };
            const update = { $set: { read: true, readAt: new Date() } };

            const result = await Notification.updateMany(filter, update);
            const notifications = await Notification.find({ receiver: userObj._id })
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                matchedCount: result.matchedCount ?? result.nMatched,
                modifiedCount: result.modifiedCount ?? result.nModified,
                notifications,
            });
        } catch (err) {
            res.status(500).json({ error: err.message || "Failed to update notifications" });
        }
    }
);

router.post(
    "/createbulknotifications",
    authenticateCookie,
    createbulkNotificationValidation,
    handleValidationErrors,
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
            req.body.sender = userObj._id;
            const membership = await Membership.findOne({ user_id: userObj._id });
            if (!membership || !membership.chapter_id) {
                return res.status(404).json({ error: "Membership or chapter not found." });
            }

            const chapterMemberships = await Membership.find({
                chapter_id: membership.chapter_id,
                membership_status: true
            }, 'user_id');

            if (!chapterMemberships || chapterMemberships.length === 0) {
                return res.status(404).json({ error: "No chapter members found for notifications." });
            }

            const { header, content, read = false, readAt = null } = req.body;
            const sender = userObj._id;

            const notifications = await Notification.insertMany(
                chapterMemberships
                    .filter(member => String(member.user_id) !== String(sender))
                    .map(member => ({
                        receiver: member.user_id,
                        sender,
                        header,
                        content,
                        read,
                        readAt
                    }))
            );
            res.status(201).json({ message: "Bulk notifications created.", count: notifications.length });
        } catch (err) {
            res.status(400).json({ error: err.message || "Failed to create notifications" });
        }
    }
);

router.post(
    "/createnotificationwithoutsender",
    authenticateCookie,
    createNotificationValidation,
    handleValidationErrors,
    mapNamesToIds,
    assertBodyObjectIds,
    handleValidationErrors,
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
            req.body.sender = userObj._id;
            const { receiver, sender, header, content, read, readAt } = req.body;
            const notif = new Notification({ receiver, sender, header, content, read, readAt });
            await notif.save();
            res.status(201).json(notif);
        } catch (err) {
            res.status(400).json({ error: err.message || "Failed to create notification" });
        }
    }
);

export default router;