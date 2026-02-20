import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoute from "./Routes/auth.js";
import bookingRoute from "./Routes/booking.js";
import userRoute from "./Routes/user.js";
import doctorRoute from "./Routes/doctor.js";
import reviewRoute from "./Routes/review.js";
import chatRoute from "./Routes/message.js";
import insightRoute from "./Routes/insight.js";
import prescriptionRoute from "./Routes/prescription.js";
import messageRoute from "./Routes/message.js";

dotenv.config();

const app = express();

// ✅ CORS config
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://hospitalfrontend-ochre.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Middleware order matters
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 REQUIRED for Vercel
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/insights", insightRoute);
app.use("/api/v1/prescriptions", prescriptionRoute);
app.use("/api/v1/messages", messageRoute);

// ✅ Mongo connection (safe for serverless)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
  }
};

connectDB();


export default app;