import express from 'express';
import mongoose from 'mongoose';
import { Event } from './eventSchema.mjs';
import {
    idValidation,
    createEventValidation,
    updateEventValidation
} from './validator.mjs';
import { mapNamesToIds, authenticateCookie, handleValidationErrors } from '../middlewares.mjs'


const router = express.Router();

router.post(
    '/createevent',
    authenticateCookie,
    createEventValidation,
    handleValidationErrors,
    mapNamesToIds,
    async (req, res) => {
        try {
            if (!req.body.chapter_id || !req.body.created_by) {
                return res.status(400).json({ message: 'Valid chapter_name and created_by_username are required.' });
            }
            const doc = new Event(req.body);
            const saved = await doc.save();
            res.status(201).json(saved);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.get('/getallevents',  authenticateCookie ,async (req, res) => {
    try {
        const docs = await Event.aggregate([
            { $sort: { event_date: -1 } },
            { $lookup: { from: 'chapters', localField: 'chapter_id', foreignField: '_id', as: 'chapter' } },
            { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'created_by', foreignField: '_id', as: 'created_by_user' } },
            { $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    event_title: 1,
                    event_description: 1,
                    event_date: 1,
                    event_time: 1,
                    location: 1,
                    organizer_company: 1,
                    vat_number: 1,
                    event_type: 1,
                    max_attendees: 1,
                    current_attendees: 1,
                    event_status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    chapter: { _id: 1, chapter_name: 1, chapter_code: 1 },
                    created_by_user: { _id: 1, username: 1, name: 1 }
                }
            }
        ]);
        res.status(200).json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/geteventbyid/:id', authenticateCookie , idValidation, handleValidationErrors, async (req, res) => {
    try {
        const [doc] = await Event.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            { $lookup: { from: 'chapters', localField: 'chapter_id', foreignField: '_id', as: 'chapter' } },
            { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'created_by', foreignField: '_id', as: 'created_by_user' } },
            { $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    event_title: 1,
                    event_description: 1,
                    event_date: 1,
                    event_time: 1,
                    location: 1,
                    organizer_company: 1,
                    vat_number: 1,
                    event_type: 1,
                    max_attendees: 1,
                    current_attendees: 1,
                    event_status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    chapter: { _id: 1, chapter_name: 1, chapter_code: 1 },
                    created_by_user: { _id: 1, username: 1, name: 1 }
                }
            }
        ]);
        if (!doc) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put(
    '/updateeventbyid/:id', authenticateCookie ,
    updateEventValidation,
    handleValidationErrors,
    mapNamesToIds,
    async (req, res) => {
        try {
            const updated = await Event.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updated) return res.status(404).json({ message: 'Event not found' });
            res.status(200).json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.delete('/deleteeventbyid/:id', authenticateCookie , idValidation, handleValidationErrors, async (req, res) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
