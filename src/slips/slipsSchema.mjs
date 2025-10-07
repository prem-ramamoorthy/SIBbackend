import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const oneToOneMeetingSchema = new Schema({
    member1_id: {
        type: Types.ObjectId,
        ref: 'profiles',
        required: true,
        index: true
    },
    member2_id: {
        type: Types.ObjectId,
        ref: 'profiles',
        required: true,
        index: true
    },
    chapter_id: {
        type: Types.ObjectId,
        ref: 'Chapters',
        required: true,
        index: true
    },
    meeting_date: {
        type: Date,
        required: true
    },
    meeting_time: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255
    },
    duration_minutes: {
        type: Number,
        required: true,
        min: 1
    },
    discussion_points: {
        type: String,
        trim: true
    },
    gains_discussed: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20
    },
    photo: {
        type: String,
        trim: true,
        maxLength: 500
    },
    created_by: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

oneToOneMeetingSchema.index({ chapter_id: 1, meeting_date: -1 });

export const OneToOneMeeting = mongoose.model('one_to_one_meetings', oneToOneMeetingSchema);