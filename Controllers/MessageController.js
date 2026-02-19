import Message from '../models/MessageSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';

// ── Patient sends message to doctor ─────────────────────────────────────────
export const sendMessage = async (req, res) => {
    const { message } = req.body;
    const { doctorId } = req.params;
    const senderId = req.userId;

    try {
        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        const newMessage = new Message({
            senderId,
            receiverId: doctorId,
            senderRole: 'patient',
            message: message.trim()
        });

        await newMessage.save();

        return res.status(201).json({
            success: true,
            message: 'Message sent',
            data: newMessage
        });
    } catch (error) {
        console.error('sendMessage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

// ── Doctor sends reply to patient ────────────────────────────────────────────
export const doctorSendMessage = async (req, res) => {
    const { message } = req.body;
    const { patientId } = req.params;
    const senderId = req.userId;

    try {
        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        const newMessage = new Message({
            senderId,
            receiverId: patientId,
            senderRole: 'doctor',
            message: message.trim()
        });

        await newMessage.save();

        return res.status(201).json({
            success: true,
            message: 'Message sent',
            data: newMessage
        });
    } catch (error) {
        console.error('doctorSendMessage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

// ── Patient fetches messages with a doctor ───────────────────────────────────
export const getMessages = async (req, res) => {
    const { doctorId } = req.params;
    const userId = req.userId;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: doctorId },
                { senderId: doctorId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('getMessages error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

// ── Doctor fetches messages with a patient ───────────────────────────────────
export const getDoctorMessages = async (req, res) => {
    const { patientId } = req.params;
    const doctorId = req.userId;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: doctorId, receiverId: patientId },
                { senderId: patientId, receiverId: doctorId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('getDoctorMessages error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

// ── Doctor gets list of all patients who messaged them ───────────────────────
export const getPatientList = async (req, res) => {
    const doctorId = req.userId;

    try {
        // Get unique patient IDs who sent messages to this doctor
        const messages = await Message.find({ receiverId: doctorId, senderRole: 'patient' })
            .distinct('senderId');

        // Fetch patient details
        const patients = await User.find({ _id: { $in: messages } })
            .select('name email photo gender');

        return res.status(200).json({ success: true, data: patients });
    } catch (error) {
        console.error('getPatientList error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch patient list' });
    }
};