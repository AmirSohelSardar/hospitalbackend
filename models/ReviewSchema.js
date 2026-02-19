import mongoose from "mongoose";
import Doctor from "./DoctorSchema.js";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (doctorId) {
  try {
    const stats = await this.aggregate([
      {
        $match: { doctor: doctorId },
      },
      {
        $group: {
          _id: "$doctor",
          numOfRating: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // FIX: stats[0] throws TypeError if no reviews exist for this doctor
    // (e.g. after the last review is deleted). Now safely resets to 0.
    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        totalRating: stats[0].numOfRating,
        averageRating: stats[0].avgRating,
      });
    } else {
      // No reviews left — reset doctor ratings to zero
      await Doctor.findByIdAndUpdate(doctorId, {
        totalRating: 0,
        averageRating: 0,
      });
    }
  } catch (error) {
    console.error("Error calculating average ratings:", error);
  }
};

// Trigger after a review is saved
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.doctor);
});

// Trigger after a review is deleted so ratings stay in sync
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.doctor);
  }
});

export default mongoose.model("Review", reviewSchema);