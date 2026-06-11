import admin from "../pages/Auth/firebase.mjs";
import { User } from "../schemas.mjs";

/**
 * Sends a push notification to multiple users.
 * @param {Array<String|ObjectId>} receiverIds - Array of user ObjectIds or user_ids
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 */
export const sendPushNotification = async (receiverIds, title, body) => {
    try {
        if (!receiverIds || receiverIds.length === 0) return;

        // Fetch users to get their FCM tokens
        const users = await User.find({ _id: { $in: receiverIds } });
        
        let allTokens = [];
        let tokenToUserIdMap = {};

        users.forEach(user => {
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                user.fcmTokens.forEach(token => {
                    allTokens.push(token);
                    tokenToUserIdMap[token] = user._id;
                });
            }
        });

        if (allTokens.length === 0) return;

        // Firebase sendMulticast accepts up to 500 tokens per batch
        const BATCH_SIZE = 500;
        const invalidTokens = [];

        for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
            const tokenBatch = allTokens.slice(i, i + BATCH_SIZE);
            
            const message = {
                notification: {
                    title,
                    body
                },
                tokens: tokenBatch
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        // Identify invalid/expired tokens to remove from DB
                        if (
                            errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/registration-token-not-registered'
                        ) {
                            invalidTokens.push(tokenBatch[idx]);
                        }
                    }
                });
            }
        }

        // Cleanup invalid tokens from database
        if (invalidTokens.length > 0) {
            // Group tokens by user to perform bulk update
            for (const user of users) {
                const userTokensToRemove = invalidTokens.filter(t => user.fcmTokens.includes(t));
                if (userTokensToRemove.length > 0) {
                    await User.updateOne(
                        { _id: user._id },
                        { $pull: { fcmTokens: { $in: userTokensToRemove } } }
                    );
                }
            }
        }
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
};
