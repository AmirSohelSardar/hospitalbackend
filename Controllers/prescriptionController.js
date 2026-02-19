import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Prescription from "../models/prescriptionSchema.js";
import { prescriptionEmail } from '../emailContents/mailContents.js';
import { sendEmail } from "../Services/emailService.js";

export const providePrescription = async (req, res) => {
    try {
        const { doctor, patient, prescriptions } = req.body;

        // Validate required fields
        if (!doctor || !patient || !prescriptions || !Array.isArray(prescriptions) || prescriptions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "DoctorId, patientId, and prescriptions are required as a non-empty array",
            });
        }

        // Validate each prescription item has required fields
        for (const item of prescriptions) {
            if (!item.medicine) {
                return res.status(400).json({
                    success: false,
                    message: "Each prescription must include a medicine name",
                });
            }
        }

        // FIX: was checking `!doctor` (the raw ID string, always truthy)
        // instead of `!doctoR` (the DB result which can be null)
        const doctoR = await Doctor.findById(doctor);
        const user = await User.findById(patient);

        if (!doctoR || !user) {
            return res.status(404).json({
                success: false,
                message: "Doctor or patient not found",
            });
        }

        const newPrescription = new Prescription({
            doctor: doctoR._id,
            patient: user._id,
            prescriptions: prescriptions,
        });

        await newPrescription.save();

        await sendEmail({
            to: user.email,
            subject: `New Prescription From Dr. ${doctoR.name}`,
            html: prescriptionEmail(doctoR.name, user.name, prescriptions),
        });

        return res.status(201).json({
            success: true,
            message: "Prescription sent successfully",
        });

    } catch (error) {
        console.error("Error sending prescription:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send prescription",
            data: error.message,
        });
    }
};