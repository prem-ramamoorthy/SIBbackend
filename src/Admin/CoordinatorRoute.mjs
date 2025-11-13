import express from 'express';
import { Coordinator } from './AdminSchemas.mjs';
import { authenticateCookie } from '../middlewares.mjs';
import { Membership } from '../chapter/ChapterSchema.mjs';
import User from '../../Auth/Schemas.mjs';

const router = express.Router();

router.post('/createcoordinators', authenticateCookie, async (req, res) => {
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

        req.body.chapter_id = membership.chapter_id;
        const { name, role, chapter_id } = req.body;
        const coordinator = new Coordinator({ name, role, chapter_id });
        await coordinator.save();
        res.status(201).json(coordinator);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/getcoordinators', authenticateCookie, async (req, res) => {
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
        const { chapter_id } = membership.chapter_id;
        const filter = chapter_id ? { chapter_id } : {};
        const coordinators = await Coordinator.find(filter)
        res.json(coordinators);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/updatecoordinatorsbyrole', authenticateCookie, async (req, res) => {
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
        const { name, role } = req.body;
        const coordinator = await Coordinator.findOneAndUpdate(
            { chapter_id: membership.chapter_id, role: role },
            { name },
        );
        if (!coordinator) return res.status(404).json({ error: 'Coordinator not found' });
        res.json(coordinator);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/deletecoordinators/:id', async (req, res) => {
    try {
        const coordinator = await Coordinator.findByIdAndDelete(req.params.id);
        if (!coordinator) return res.status(404).json({ error: 'Coordinator not found' });
        res.json({ message: 'Coordinator deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;