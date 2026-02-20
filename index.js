import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./Routes/auth.js"
import bookingRoute from "./Routes/booking.js"
import userRoute from "./Routes/user.js"
import doctorRoute from "./Routes/doctor.js"
import reviewRoute from "./Routes/review.js"
import chatRoute from "./Routes/message.js"
import insightRoute from "./Routes/insight.js"
import prescriptionRoute from "./Routes/prescription.js"
import messageRoute from './Routes/message.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://hospitalfrontend-ochre.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Cached connection for Vercel serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log("MongoDB database is connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    isConnected = false;
    throw err;
  }
};

// ✅ Connect before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Api is working");
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/doctors', doctorRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/insights', insightRoute);
app.use('/api/v1/prescriptions', prescriptionRoute);
app.use('/api/v1/messages', messageRoute);

// ✅ Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log("Server is running on port: " + port);
  });
}

export default app;