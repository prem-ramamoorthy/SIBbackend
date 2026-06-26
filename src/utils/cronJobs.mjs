import cron from 'node-cron';
import { MemberProfile, User } from '../schemas.mjs';
import { sendPushNotification } from './fcmHelper.mjs';

const startCronJobs = () => {
    // Run every day at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log("Running daily celebrations check for push notifications...");
            
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();

            // Find all profiles with DOB or wedding_date
            const pipeline = [
                {
                    $match: {
                        $or: [
                            { dob: { $ne: null } },
                            { wedding_date: { $ne: null } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        memberName: { $ifNull: ["$display_name", "$user.username"] },
                        dob: 1,
                        wedding_date: 1
                    }
                }
            ];

            const profiles = await MemberProfile.aggregate(pipeline);
            
            let todaysCelebrantsCount = 0;
            let sampleCelebrant = null;
            let sampleCelebrantType = null;

            profiles.forEach(p => {
                let hasCelebrationToday = false;
                let currentType = null;
                
                if (p.dob) {
                    const dobDate = new Date(p.dob);
                    if (dobDate.getMonth() === currentMonth && dobDate.getDate() === currentDay) {
                        hasCelebrationToday = true;
                        currentType = 'birthday';
                    }
                }
                
                if (p.wedding_date) {
                    const weddingDate = new Date(p.wedding_date);
                    if (weddingDate.getMonth() === currentMonth && weddingDate.getDate() === currentDay) {
                        hasCelebrationToday = true;
                        // Prioritize anniversary if both happen today (rare but possible)
                        currentType = 'wedding anniversary'; 
                    }
                }

                if (hasCelebrationToday) {
                    todaysCelebrantsCount++;
                    if (!sampleCelebrant) {
                        sampleCelebrant = p.memberName;
                        sampleCelebrantType = currentType;
                    }
                }
            });

            if (todaysCelebrantsCount > 0) {
                console.log(`Found ${todaysCelebrantsCount} celebrant(s) today. Preparing push notification blast.`);
                
                // Fetch all users to broadcast the notification
                const allUsers = await User.find({}, '_id').lean();
                const allUserIds = allUsers.map(u => u._id);

                let title = "🎉 Special Celebrations Today!";
                let body = "";

                if (todaysCelebrantsCount === 1) {
                    body = `It's ${sampleCelebrant}'s ${sampleCelebrantType} today! Tap here to drop a warm wish. ✨`;
                } else {
                    body = `It's ${sampleCelebrant}'s ${sampleCelebrantType} and ${todaysCelebrantsCount - 1} other member(s) are celebrating today! Tap to send them your wishes. 💖`;
                }

                const data = {
                    action: "OPEN_WALL_OF_WISHES"
                };

                // Send bulk notification using fcmHelper
                await sendPushNotification(allUserIds, title, body, data);
                console.log("Daily celebrations push notification sent.");
            } else {
                console.log("No celebrations today.");
            }

        } catch (error) {
            console.error("Error running daily celebrations cron job:", error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log("Cron jobs scheduled.");
};

export default startCronJobs;
