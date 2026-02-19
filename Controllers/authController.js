import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from '../Services/emailService.js';
import { succesRegistration } from '../emailContents/mailContents.js';
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15d" }
  );
};

// register controller
export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;

  try {
    let user = null;

    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    } else {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      user = new User({ name, email, password: hashPassword, photo, gender, role });
    } else if (role === "doctor") {
      user = new Doctor({ name, email, password: hashPassword, photo, gender, role });
    }

    await user.save();

    const options = {
      to: email,
      subject: `Confirm Your Email, Team Lifeline Hospital`,
      html: succesRegistration(
        name,
        email,
        `${process.env.CLIENT_SITE_URL}/confirm_email/${user._id}`
      ),
    };

    await sendEmail(options);

    return res.status(201).json({
      success: true,
      message: "User successfully created, Check your Email!",
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed, please try again",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;

    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    if (patient) {
      user = patient;
    } else if (doctor) {
      user = doctor;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const token = generateToken(user);

    const { password: pwd, appointments, role, ...rest } = user._doc;
    const userId = rest._id.toString();
    const isPremiumUser = rest.isPremiumUser || false;

    return res.status(200).json({
      success: true,
      message: "Successfully logged in",
      token,
      data: { ...rest },
      role,
      userId,
      isPremiumUser,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Failed to login, please try again" });
  }
};

export const confirmEmail = async (req, res) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findById(verificationToken);
    const doctor = await Doctor.findById(verificationToken);

    if (!user && !doctor) {
      return res.status(400).json({ success: false, message: "No user found with this token" });
    }

    if (user) {
      if (user.emailVerified) {
        return res.status(400).json({ success: false, message: "Email already verified" });
      }
      user.emailVerified = true;
      await user.save();
    } else if (doctor) {
      if (doctor.emailVerified) {
        return res.status(400).json({ success: false, message: "Email already verified" });
      }
      doctor.emailVerified = true;
      await doctor.save();
    }

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Confirm email error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify email" });
  }
};