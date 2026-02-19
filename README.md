# 🏥 Lifeline Hospital — Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

A robust, secure RESTful API for a full-featured hospital management system. Built with Node.js, Express.js and MongoDB Atlas. Handles authentication, appointments, payments, chat, prescriptions and more.


**🔗 Frontend Repo:** [github.com/AmirSohelSardar/hospitalfrontend](https://github.com/AmirSohelSardar/hospitalfrontend)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Models](#-database-models)
- [Authentication](#-authentication)
- [Deployment](#-deployment-on-vercel)

---

## ✨ Features

### 🔐 Authentication & Security
- ✅ JWT-based authentication with 15-day token expiry
- ✅ Role-based access control (patient / doctor / admin)
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ Email verification on registration
- ✅ Secure password reset via email token
- ✅ Protected routes with middleware

### 👤 User Management
- ✅ Patient registration and profile management
- ✅ Doctor registration with full profile (bio, specialization, qualifications, experience, time slots)
- ✅ Profile photo upload via Cloudinary
- ✅ Certificate upload for qualifications and experience
- ✅ Blood type, gender, phone tracking
- ✅ Account deletion

### 🗓️ Appointment System
- ✅ Stripe checkout session creation for appointment booking
- ✅ Slot availability check (max 10 bookings per day per doctor)
- ✅ Appointment date and time tracking
- ✅ Payment status tracking (isPaid, status)
- ✅ Booking confirmation emails to both patient and doctor
- ✅ Patient can view all their appointments

### 👨‍⚕️ Doctor Management
- ✅ Admin approval system (pending / approved / cancelled)
- ✅ Doctor profile with time slots, qualifications, experiences
- ✅ Average rating calculation on each new review
- ✅ Doctor search and filter
- ✅ Admin can edit any doctor profile

### ⭐ Review System
- ✅ Patients can submit star ratings (1-5) and written reviews
- ✅ Auto-calculation of average rating and total rating count
- ✅ Reviews populated with reviewer name and photo

### 💬 Chat System
- ✅ Premium patients can send messages to their doctors
- ✅ Doctors can view all patient messages and reply
- ✅ Message history stored in MongoDB
- ✅ Separate endpoints for patient and doctor message flows

### 📋 Prescription System
- ✅ Doctors can provide prescriptions to patients
- ✅ Prescription data stored per booking

### 👑 Premium Users
- ✅ Stripe payment for premium upgrade
- ✅ isPremiumUser flag on user profile
- ✅ Premium unlocks chat and insights features

### 📧 Email Notifications
- ✅ Registration confirmation email
- ✅ Email verification link
- ✅ Password reset email
- ✅ Booking confirmation to patient
- ✅ New booking notification to doctor
- ✅ Prescription notification email

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18.x | Runtime environment |
| Express.js | 4.x | Web framework |
| MongoDB | Atlas | Cloud database |
| Mongoose | 7.x | ODM for MongoDB |
| JWT | jsonwebtoken | Authentication tokens |
| Bcrypt.js | latest | Password hashing |
| Stripe | latest | Payment processing |
| Nodemailer | latest | Email sending |
| Cloudinary | latest | Image/file storage |
| Dotenv | latest | Environment variables |
| Cors | latest | Cross-origin requests |
| Nodemon | 3.x | Development auto-restart |

---

## 📁 Project Structure

```
backend/
├── auth/
│   └── verifyToken.js        # JWT middleware, role restriction
├── Controllers/
│   ├── authController.js     # Register, login, email verify
│   ├── bookingController.js  # Stripe checkout session
│   ├── doctorController.js   # Doctor CRUD, approve, reject
│   ├── messageController.js  # Chat send/receive
│   ├── prescriptionController.js # Prescription CRUD
│   ├── reviewController.js   # Reviews CRUD
│   └── userController.js     # User CRUD, premium upgrade
├── emailContents/
│   └── mailContents.js       # HTML email templates
├── models/
│   ├── BookingSchema.js      # Appointment booking model
│   ├── DoctorSchema.js       # Doctor model with rating calc
│   ├── MessageSchema.js      # Chat message model
│   ├── PrescriptionSchema.js # Prescription model
│   ├── ReviewSchema.js       # Review model with rating calc
│   └── UserSchema.js         # Patient user model
├── Routes/
│   ├── auth.js               # /api/v1/auth
│   ├── booking.js            # /api/v1/bookings
│   ├── doctor.js             # /api/v1/doctors
│   ├── message.js            # /api/v1/messages
│   ├── review.js             # /api/v1/reviews
│   └── user.js               # /api/v1/users
├── Services/
│   └── emailService.js       # Nodemailer transporter
├── .env                      # Environment variables
├── vercel.json               # Vercel deployment config
├── server.js                 # Entry point
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (free tier works)
- Stripe account (test mode)
- Gmail account with App Password enabled
- Cloudinary account (free tier works)

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/AmirSohelSardar/hospitalbackend.git
cd hospitalbackend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=Cluster0
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_SITE_URL=http://localhost:5173
JWT_SECRET_KEY=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

**4. Start development server:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port | ✅ |
| `MONGO_URI` | MongoDB Atlas connection string | ✅ |
| `EMAIL_HOST` | SMTP host (smtp.gmail.com) | ✅ |
| `EMAIL_PORT` | SMTP port (587) | ✅ |
| `EMAIL_USER` | Gmail address | ✅ |
| `EMAIL_PASS` | Gmail App Password (not regular password) | ✅ |
| `CLIENT_SITE_URL` | Frontend URL for email links | ✅ |
| `JWT_SECRET_KEY` | Secret key for JWT signing | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) | ✅ |

### Gmail App Password Setup
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App Passwords" → Create for Mail
4. Use the generated 16-character password as `EMAIL_PASS`

---

## 📡 API Endpoints

### Auth Routes — `/api/v1/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register patient or doctor |
| POST | `/login` | Public | Login and get JWT token |
| GET | `/confirm_email/:token` | Public | Verify email address |

### User Routes — `/api/v1/users`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | Get all users |
| GET | `/profile/me` | Patient | Get own profile |
| PUT | `/:id` | Patient | Update profile |
| DELETE | `/:id` | Patient/Admin | Delete account |
| GET | `/appointments/my-appointments` | Patient | Get own bookings |
| POST | `/upgrade-to-premium` | Patient | Upgrade to premium |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password` | Public | Reset password |

### Doctor Routes — `/api/v1/doctors`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all approved doctors |
| GET | `/:id` | Public | Get single doctor |
| GET | `/profile/me` | Doctor | Get own profile |
| PUT | `/:id` | Doctor/Admin | Update doctor profile |
| DELETE | `/:id` | Doctor/Admin | Delete doctor |
| GET | `/searchresult` | Public | Search doctors |
| PUT | `/approve/:id` | Admin | Approve doctor |
| PUT | `/reject/:id` | Admin | Reject doctor |

### Booking Routes — `/api/v1/bookings`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/checkout-session/:doctorId` | Patient | Create Stripe checkout |

### Review Routes — `/api/v1/doctors/:doctorId/reviews`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get doctor reviews |
| POST | `/` | Patient | Submit review |

### Message Routes — `/api/v1/messages`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/send/:doctorId` | Patient | Send message to doctor |
| GET | `/:doctorId` | Patient | Get messages with doctor |
| POST | `/doctor/send/:patientId` | Doctor | Reply to patient |
| GET | `/doctor/:patientId` | Doctor | Get messages with patient |
| GET | `/doctor/patients/list` | Doctor | Get all patients who messaged |

---

## 🗄 Database Models

### User (Patient)
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  photo: String (Cloudinary URL),
  gender: String (male/female/others),
  bloodType: String,
  phone: String,
  role: String (default: 'patient'),
  isPremiumUser: Boolean (default: false),
  emailVerified: Boolean (default: false),
  appointments: [BookingSchema ref]
}
```

### Doctor
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  photo: String,
  gender: String,
  phone: String,
  bio: String,
  specialization: String,
  ticketPrice: Number,
  about: String,
  role: String (default: 'doctor'),
  isApproved: String (pending/approved/cancelled),
  emailVerified: Boolean,
  qualifications: [{ degree, university, startingDate, endingDate, certificate }],
  experiences: [{ position, hospital, startingDate, endingDate, certificate }],
  timeSlots: [{ day, startingTime, endingTime }],
  reviews: [ReviewSchema ref],
  averageRating: Number (default: 0),
  totalRating: Number (default: 0),
  appointments: [BookingSchema ref]
}
```

### Booking
```js
{
  doctor: Doctor ref,
  user: User ref,
  ticketPrice: Number,
  appointmentDate: Date,
  appointmentTime: String,
  status: String (pending/approved/cancelled),
  isPaid: Boolean (default: true),
  session: String (Stripe session ID)
}
```

### Review
```js
{
  doctor: Doctor ref,
  user: User ref,
  reviewText: String,
  rating: Number (min:0, max:5),
  // Auto-calculates doctor averageRating on save
}
```

### Message
```js
{
  senderId: ObjectId,
  receiverId: ObjectId,
  senderRole: String (patient/doctor),
  message: String,
  createdAt: Date
}
```

---

## 🔑 Authentication

All protected routes require JWT token in request header:
```
Authorization: Bearer <your_jwt_token>
```

### Middleware

**`authenticate`** — Verifies JWT token, attaches `userId` and `role` to request

**`restrict(roles)`** — Checks if user role is in allowed roles array
```js
// Example: only doctors and admins can access
router.put('/:id', authenticate, restrict(['doctor', 'admin']), updateDoctor);
```

### Token Generation
```js
jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET_KEY,
  { expiresIn: '15d' }
)
```

---

## 🚀 Deployment on Vercel

**1. Add `vercel.json` to backend root:**
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

**2. Add `export default app` at bottom of `server.js`**

**3. Push to GitHub**

**4. Go to [vercel.com](https://vercel.com) → New Project → Import repo**

**5. Add all environment variables in Vercel dashboard**

**6. Deploy**

**7. MongoDB Atlas — Allow all IPs:**
- Atlas Dashboard → Network Access → Add IP → `0.0.0.0/0`

---

## 🔒 Security Best Practices Implemented

- Passwords hashed with bcrypt before storing
- JWT tokens expire after 15 days
- Email must be verified before login
- Role-based middleware on all sensitive routes
- Environment variables for all secrets
- CORS configured for frontend origin only
- Input validation on critical endpoints

---

## 👨‍💻 Developer

**Amir Sohel Sardar**
- GitHub: [@AmirSohelSardar](https://github.com/AmirSohelSardar)
- Email: sohelamirsohel786@gmail.com

---

<div align="center">
Made with ❤️ using Node.js, Express.js & MongoDB
</div>
