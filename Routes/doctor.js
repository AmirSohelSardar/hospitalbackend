import express from "express";
import {
  updateDoctor,
  deleteDoctor,
  getAllDoctor,
  getSingleDoctor,
  getDoctorProfile,
  searchDoctor,
  unapprovedDoctors,
  approveDoctor,
  rejectDoctor
} from "../Controllers/doctorController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

import reviewRouter from "./review.js";

const router = express.Router();

router.use("/:doctorId/reviews", reviewRouter);
router.get("/unapproved", unapprovedDoctors);
router.get("/profile/me", authenticate, restrict(["doctor"]), getDoctorProfile);
router.get("/searchresult", searchDoctor);
router.get("/:id", getSingleDoctor);
router.put("/approve/:id", approveDoctor);
router.put("/reject/:id", rejectDoctor);
router.get("/", getAllDoctor);

// FIX: allow both "doctor" and "admin" roles to update a doctor profile
router.put("/:id", authenticate, restrict(["doctor", "admin"]), updateDoctor);
router.delete("/:id", authenticate, restrict(["doctor", "admin"]), deleteDoctor);

export default router;