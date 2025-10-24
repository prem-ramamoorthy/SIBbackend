import express from 'express';
import mongoose from 'mongoose';
import { TYFTB } from './slipsSchema.mjs';
import { createTyftbValidation, updateTyftbValidation, idValidation } from './validator.mjs';
import { mapNamesToIds, authenticateCookie, handleValidationErrors } from '../middlewares.mjs';
import User from '../../Auth/Schemas.mjs';

const router = express.Router();

router.post(
    '/createtyftb',
    authenticateCookie,
    createTyftbValidation,
    handleValidationErrors,
    mapNamesToIds,
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

            req.body.payer_id = userObj._id;

            if (!req.body.payer_id || !req.body.receiver_id)
                return res.status(400).json({ message: 'Payer and receiver must be specified and valid.' });
            const tyftb = new TYFTB(req.body);
            const saved = await tyftb.save();
            res.status(201).json("TYFTB record created successfully with ID: " + saved._id);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.get('/getalltyftb', authenticateCookie, async (req, res) => {
    try {
        const results = await TYFTB.aggregate([
            { $sort: { date_closed: -1 } },
            {
                $lookup: {
                    from: 'referrals',
                    localField: 'referral_id',
                    foreignField: '_id',
                    as: 'referral'
                }
            },
            { $unwind: { path: '$referral', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'payer_id',
                    foreignField: '_id',
                    as: 'payer'
                }
            },
            { $unwind: { path: '$payer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'receiver_id',
                    foreignField: '_id',
                    as: 'receiver'
                }
            },
            { $unwind: { path: '$receiver', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    referral: { referral_code: 1, contact_name: 1 },
                    payer: { _id: 1, display_name: 1 },
                    receiver: { _id: 1, display_name: 1 },
                    business_type: 1,
                    referral_type: 1,
                    business_amount: 1,
                    currency: 1,
                    business_description: 1,
                    date_closed: 1,
                    invoice_number: 1,
                    verification_status: 1,
                    created_at: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/gettyftbbyid/:id',
    authenticateCookie,
    idValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const [doc] = await TYFTB.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
                {
                    $lookup: {
                        from: 'referrals',
                        localField: 'referral_id',
                        foreignField: '_id',
                        as: 'referral'
                    }
                },
                { $unwind: { path: '$referral', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'profiles',
                        localField: 'payer_id',
                        foreignField: '_id',
                        as: 'payer'
                    }
                },
                { $unwind: { path: '$payer', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'profiles',
                        localField: 'receiver_id',
                        foreignField: '_id',
                        as: 'receiver'
                    }
                },
                { $unwind: { path: '$receiver', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        referral: { referral_code: 1, contact_name: 1 },
                        payer: { _id: 1, display_name: 1 },
                        receiver: { _id: 1, display_name: 1 },
                        business_type: 1,
                        referral_type: 1,
                        business_amount: 1,
                        currency: 1,
                        business_description: 1,
                        date_closed: 1,
                        invoice_number: 1,
                        verification_status: 1,
                        created_at: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);
            if (!doc) return res.status(404).json({ message: 'TYFTB record not found' });
            res.status(200).json(doc);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.put(
    '/updatetyftbbyid/:id',
    authenticateCookie,
    updateTyftbValidation,
    handleValidationErrors,
    mapNamesToIds,
    async (req, res) => {
        try {
            const updated = await TYFTB.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updated)
                return res.status(404).json({ message: 'TYFTB record not found' });

            const [doc] = await TYFTB.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(updated._id) } },
                { $lookup: { from: 'referrals', localField: 'referral_id', foreignField: '_id', as: 'referral' } },
                { $unwind: { path: '$referral', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'profiles', localField: 'payer_id', foreignField: '_id', as: 'payer' } },
                { $unwind: { path: '$payer', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'profiles', localField: 'receiver_id', foreignField: '_id', as: 'receiver' } },
                { $unwind: { path: '$receiver', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        referral: { referral_code: 1, contact_name: 1 },
                        payer: { _id: 1, display_name: 1 },
                        receiver: { _id: 1, display_name: 1 },
                        business_type: 1,
                        referral_type: 1,
                        business_amount: 1,
                        currency: 1,
                        business_description: 1,
                        date_closed: 1,
                        invoice_number: 1,
                        verification_status: 1,
                        created_at: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);
            res.status(200).json(doc);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.delete(
    '/deletetyftbbyid/:id',
    authenticateCookie,
    idValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const deleted = await TYFTB.findByIdAndDelete(req.params.id);
            if (!deleted)
                return res.status(404).json({ message: 'TYFTB record not found' });
            res.status(200).json({ message: 'TYFTB record deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

export default router;
