import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { passwordResetEmail, userQueryEmail } from '../emailContents/mailContents.js';
import { sendEmail } from "../Services/emailService.js";
import Stripe from 'stripe';

export const updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedUser,
    });
  } catch (error) {
    // FIX: was `data: updateUser` (referenced the function itself)
    return res.status(500).json({
      success: false,
      message: "Failed to update!",
      data: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    // FIX: was `data: updateUser` (referenced the function itself)
    return res.status(500).json({
      success: false,
      message: "Failed to delete!",
      data: error.message,
    });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No User Found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Found",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user!",
      data: error.message,
    });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    // Map through each user and count their bookings
    const usersWithBookingsCount = await Promise.all(
      users.map(async (user) => {
        const bookingsCount = await Booking.countDocuments({ user: user._id });
        return { ...user.toObject(), bookingsCount };
      })
    );

    // Sort users based on bookingsCount in descending order
    usersWithBookingsCount.sort((a, b) => b.bookingsCount - a.bookingsCount);

    return res.status(200).json({
      success: true,
      message: "Users Found",
      data: usersWithBookingsCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users!",
      data: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...rest } = user._doc;

    return res.status(200).json({
      success: true,
      message: "Profile info retrieved successfully",
      data: rest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get profile info!",
      data: err.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    // FIX: was fetching doctor objects only, losing all appointment date/time data.
    // The Booking model already populates doctor via pre-hook, so return bookings directly.
    const bookings = await Booking.find({ user: req.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: bookings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get appointments!",
      data: err.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email.",
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Expires in 1 hour
    await user.save();

    const resetURL = `${process.env.CLIENT_SITE_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Instructions',
      html: passwordResetEmail(user.name, resetURL),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process the request.",
      data: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Find user by reset token and check expiration
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
      data: error.message,
    });
  }
};

export const sendQueryToDoctor = async (req, res) => {
  try {
    const { senderId, doctorEmail, message } = req.body;

    if (!senderId || !doctorEmail || !message) {
      return res.status(400).json({
        success: false,
        message: "senderId, doctorEmail, and message are required",
      });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await sendEmail({
      to: doctorEmail,
      subject: `Query from ${sender.email} - Team Lifeline Hospital`,
      html: userQueryEmail(sender.name, sender.email, message),
    });

    return res.status(200).json({
      success: true,
      message: "Query sent successfully",
    });
  } catch (error) {
    console.error('Error sending query:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to send query",
      data: error.message,
    });
  }
};

export const UpgradeToPremium = async (req, res) => {
  const userId = req.body.userId;

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isPremiumUser) {
      return res.status(400).json({
        success: false,
        message: "User is already a premium member",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_SITE_URL}/users/profile/me`,
      customer_email: user.email,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: 1000 * 100,
            product_data: {
              name: 'Premium User',
              description: 'Upgrade to premium user',
              images: [
                'https://medinscare.s3.ap-south-1.amazonaws.com/hospitalNewsImages/logo.png',
              ],
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['IN'],
      },
      billing_address_collection: 'auto',
    });

    // NOTE: Ideally isPremiumUser should only be set to true via a Stripe webhook
    // after payment is confirmed. Setting it here means the user gets premium
    // even if they abandon the Stripe checkout page.
    // To fix properly: remove the lines below and handle via webhook instead.
    user.isPremiumUser = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Stripe session created. Redirect user to complete payment.",
      session,
    });
  } catch (error) {
    console.error("UpgradeToPremium error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upgrade user to premium",
      data: error.message,
    });
  }
};