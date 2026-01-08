import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./pages/Auth/routes.mjs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./utils/mongo_connection.mjs";
import AdminRouter from './pages/admin/AdminRoute.mjs'
import ChapterRouter from "./pages/chapter/MainRoute.mjs";
import ProfileRouter from "./pages/profile/profileRoute.mjs";
import MeetingRouter from "./pages/meetings/meetingRoute.mjs";
import slipsRouter from "./pages/slips/slipsRoute.mjs";
import MemberRouter from "./pages/members/memberRoute.mjs";
import EventRouter from "./pages/events/eventRoute.mjs";
import DashboardRouter from "./pages/dashboard/dashboardRoute.mjs";
import NotificationRouter from './pages/notifications/notificationRoute.mjs'
import ActivityRouter from './pages/activity/activityRoute.mjs'
import { authenticateCookie } from "./middlewares.mjs";

connectDB();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "https://www.senguntharinbusiness.in", // your live website
  "https://localhost",                   // Android WebView (Capacitor HTTPS mode)
  "http://localhost",                    // sometimes used by Capacitor in dev
  "capacitor://localhost",
  "http://localhost:5173"               // official Capacitor app origin
];

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});
app.use("/auth", authRoutes);

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.use(authenticateCookie);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});
app.use("/auth", authRoutes);

app.use(authenticateCookie);

app.use('/admin', AdminRouter);
app.use('/chapter', ChapterRouter)
app.use('/profile', ProfileRouter)
app.use('/meeting', MeetingRouter)
app.use('/slips', slipsRouter)
app.use('/member', MemberRouter)
app.use('/event', EventRouter)
app.use('/dashboard', DashboardRouter)
app.use('/notification', NotificationRouter)
app.use('/activity', ActivityRouter)


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
