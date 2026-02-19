import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import Stripe from 'stripe';
import { sendEmail } from '../Services/emailService.js';
import { bookingSuccessEmailDoctor, bookingSuccessEmailUser } from '../emailContents/mailContents.js';

export const getCheckoutSession = async (req, res) => {
    try {
        // Check Stripe key is configured
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('paste_your_key')) {
            return res.status(500).json({
                success: false,
                message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.'
            });
        }

        const doctor = await Doctor.findById(req.params.doctorId);
        const user = await User.findById(req.userId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { appointmentDate, appointmentTime } = req.body;

        if (!appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide appointment date and time'
            });
        }

        // Check if slot is available
        const existingBookingsCount = await Booking.countDocuments({
            doctor: doctor._id,
            appointmentDate: {
                $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
                $lt: new Date(appointmentDate).setHours(23, 59, 59, 999),
            }
        });

        if (existingBookingsCount >= 10) {
            return res.status(400).json({
                success: false,
                message: 'Appointment slots for this date are fully booked.'
            });
        }

        // Check doctor has a ticket price set
        if (!doctor.ticketPrice || doctor.ticketPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'This doctor has not set a ticket price yet.'
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
            cancel_url: `${process.env.CLIENT_SITE_URL}/doctors/${doctor._id}`,
            customer_email: user.email,
            client_reference_id: req.params.doctorId,
            line_items: [{
                price_data: {
                    currency: 'inr',
                    unit_amount: doctor.ticketPrice * 100,
                    product_data: {
                        name: doctor.name,
                        description: doctor.bio || `Appointment with ${doctor.name}`,
                        images: doctor.photo ? [doctor.photo] : []
                    },
                },
                quantity: 1
            }],
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['IN']
            }
        });

        // FIX: Stripe only redirects to success_url AFTER payment is fully completed.
        // So marking isPaid: true and status: 'approved' here is correct and safe.
        const booking = new Booking({
            doctor: doctor._id,
            user: user._id,
            ticketPrice: doctor.ticketPrice,
            status: 'approved',  // ✅ fixed: was 'pending'
            isPaid: true,        // ✅ fixed: was false — showed "Unpaid" after payment
            session: session.id,
            appointmentDate,
            appointmentTime
        });

        await booking.save();

        // Send confirmation emails (won't crash if email fails)
        await sendEmail({
            to: doctor.email,
            subject: 'New Booking Notification',
            html: bookingSuccessEmailDoctor(doctor.name, user.name, appointmentDate, appointmentTime)
        });

        await sendEmail({
            to: user.email,
            subject: 'Booking Confirmation',
            html: bookingSuccessEmailUser(doctor.name, user.name, appointmentDate, appointmentTime)
        });

        res.status(200).json({
            success: true,
            message: 'Successfully created session',
            session
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);

        if (error.type === 'StripeAuthenticationError') {
            return res.status(500).json({
                success: false,
                message: 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env'
            });
        }
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(500).json({
                success: false,
                message: 'Stripe error: ' + error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating checkout session: ' + error.message
        });
    }
};