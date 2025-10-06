import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./Auth/routes.mjs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./mongo_connection.mjs";
import AdminRouter from './src/Admin/AdminRoute.mjs'
import ChapterRouter from "./src/chapter/MainRoute.mjs";
import ProfileRouter from "./src/profile/profileRoute.mjs";
import MeetingRouter from "./src/meetings/meetingRoute.mjs";

connectDB() ;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.LINK,
    credentials: true,
  })
);

app.use("/auth", authRoutes);
app.use('/admin', AdminRouter);
app.use('/chapter' , ChapterRouter)
app.use('/profile', ProfileRouter)
app.use('/meeting', MeetingRouter)

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
