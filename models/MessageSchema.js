import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Types.ObjectId,
            required: true,
            refPath: 'senderRole'
        },
        receiverId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        // 'patient' or 'doctor' — used to identify who sent the message
        senderRole: {
            type: String,
            enum: ['patient', 'doctor'],
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);