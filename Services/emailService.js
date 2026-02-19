import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (options) => {
    try {
        await transporter.sendMail(options);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        // FIX: Don't throw error - registration/booking should succeed
        // even if email sending fails (e.g. wrong credentials)
        // throw new Error('Failed to send email');
    }
};

export { sendEmail };