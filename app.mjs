import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./Auth/routes.mjs";

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
app.get('/', (req, res) => {
	res.status(200).sendFile(__dirname + '/index.html')
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
