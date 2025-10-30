import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema(
    {
        receiver: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sender: {
            type: Types.ObjectId,
            ref: 'User',
        },
        header: {
            type: String,
        },
        content: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Notification = mongoose.model('Notifications', NotificationSchema);