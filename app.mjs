import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./Auth/routes.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:3000", // your frontend URL
		credentials: true,              // allow cookies
	})
);

app.use("/auth", authRoutes);
app.get("/", (req, res) => {
	res.status(200).sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
