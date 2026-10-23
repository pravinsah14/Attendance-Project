# AttendX — Full-Stack MERN Attendance Management System

A robust, enterprise-grade Attendance Management System built with the **MERN** stack that tracks employee attendance using **live webcam selfie verification** and **real-time GPS geolocation**, with Role-Based Access Control (**RBAC**), overtime workflows, manager verification, and automated reporting.

---

## 🌟 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 (Vite) | High-performance SPA with modern tooling |
| **State Management** | Redux Toolkit & RTK Query | Cache management, optimistic updates, query tags |
| **Styling** | Tailwind CSS & React Icons | Clean, responsive, modern dashboard interface |
| **Live Camera** | React-Webcam | Enforced camera selfie capture (file upload blocked) |
| **Geolocation** | HTML5 Geolocation API | Precise latitude, longitude, and reverse geocoded address |
| **Backend** | Node.js + Express.js | Scalable REST API with modular architecture |
| **Database** | MongoDB + Mongoose | Schema validation, compound indexes, relational refs |
| **Logging** | Winston + Morgan | Combined and error file logging with Morgan HTTP requests |
| **Authentication** | JWT (JSON Web Tokens) + Bcrypt | Secure password hashing (10 rounds) and Bearer token auth |

---

## 👥 User Roles & Permissions

| Feature / Action | Employee | Manager | Admin |
|---|:---:|:---:|:---:|
| **Punch In / Punch Out** (Live Selfie + GPS) | ✅ | — | — |
| **View Personal Attendance & Hours** | ✅ | ✅ | ✅ |
| **Submit Overtime Request** | ✅ | — | — |
| **View Team Attendance** | — | ✅ | ✅ |
| **Approve / Reject Overtime** | — | ✅ | ✅ |
| **Validate Attendance (Selfie Inspection)** | — | ✅ (Team only) | ✅ (All) |
| **Daily Attendance Reports** | ✅ (Own) | ✅ (Team) | ✅ (All) |
| **User & Role Management** | — | — | ✅ |

---

## 📐 Architecture Overview

```
                      +---------------------------------------+
                      |           React Client (Vite)         |
                      |  - Redux Toolkit + RTK Query Caching  |
                      |  - Webcam Selfie + Geolocation Capture |
                      +-------------------+-------------------+
                                          |
                                    HTTPS / REST
                                          |
                      +-------------------v-------------------+
                      |          Express.js REST API          |
                      |  - Morgan HTTP Logger                 |
                      |  - Winston File Logger                |
                      |  - JWT Authentication Middleware      |
                      |  - RBAC Middleware (Role Validation)   |
                      +-------------------+-------------------+
                                          |
                                Mongoose ODM / Driver
                                          |
                      +-------------------v-------------------+
                      |            MongoDB Database           |
                      |  - Users Collection                   |
                      |  - Attendance Collection (Indexed)    |
                      |  - OvertimeRequests Collection        |
                      +---------------------------------------+
```

### Folder Structure

```
5y/
├── package.json               # Root scripts for concurrently running or seeding
├── README.md                  # Complete documentation
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # Mongoose connection & disconnect handling
│   │   │   └── logger.js      # Winston logger transports
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── overtime.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # Bearer JWT verification
│   │   │   ├── role.middleware.js   # RBAC permission check
│   │   │   └── error.middleware.js  # Global centralized error handler
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Attendance.model.js
│   │   │   └── OvertimeRequest.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── overtime.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── user.routes.js
│   │   ├── seed.js            # Database seeder with demo accounts
│   │   └── app.js             # Express application assembly
│   ├── server.js              # Server bootstrapper & listener
│   ├── .env.example
│   └── package.json
└── client/                    # Vite + React frontend
    ├── src/
    │   ├── app/
    │   │   ├── api.js         # Base RTK Query API
    │   │   └── store.js       # Redux store
    │   ├── features/
    │   │   ├── auth/          # Auth slice & RTK Query endpoints
    │   │   ├── attendance/    # Attendance RTK Query endpoints
    │   │   ├── overtime/      # Overtime RTK Query endpoints
    │   │   ├── reports/       # Reports RTK Query endpoints
    │   │   └── users/         # Users RTK Query endpoints
    │   ├── components/
    │   │   ├── Layout/        # Header, Sidebar (role-aware), Layout shell
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── RoleRoute.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── AttendanceCard.jsx
    │   │   ├── OvertimeCard.jsx
    │   │   └── SelfieCapture.jsx # Live camera capture using react-webcam
    │   ├── pages/
    │   │   ├── auth/ (Login, Register)
    │   │   ├── employee/ (EmployeeDashboard, PunchPage, MyOvertime)
    │   │   ├── manager/ (ManagerDashboard, OvertimeApproval)
    │   │   ├── admin/ (AdminDashboard, UserManagement)
    │   │   └── shared/ (AttendanceReport, AttendanceValidation)
    │   ├── hooks/useAuth.js
    │   ├── utils/dateUtils.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Core Features Implemented

### 1. Authentication & Role-Based Access Control (RBAC)
- **JWT-based stateless authentication** with tokens stored securely in client state and passed via Bearer headers.
- **Role separation**: `employee`, `manager`, `admin`.
- **Frontend guards**: `ProtectedRoute` checks active login; `RoleRoute` verifies required role and redirects unauthorized attempts.
- **Backend authorization**: `protect` middleware verifies JWT authenticity; `authorize('role1', 'role2')` enforces route-level access.

### 2. Attendance (Live Webcam + Geolocation Verification)
- **Live Selfie Capture**: Strictly uses device camera stream via `react-webcam` (file uploads are disabled by design to eliminate spoofing). Captured photo is converted to base64.
- **GPS Coordinates**: Uses HTML5 Geolocation API to fetch live latitude and longitude with reverse geocoding via OpenStreetMap Nominatim.
- **Punch In / Punch Out**:
  - One punch-in per day per user (enforced via unique compound index `{ userId, date }`).
  - Punch-out records timestamp, automatically computes `totalHours` in decimal.
  - Automatically tags shift as **Completed** (≥ 8.0 hours) or **Incomplete** (< 8.0 hours).

### 3. Overtime Workflow
- If worked hours are incomplete or employee works extra, the employee submits an overtime request with requested hours and justification.
- Overtime requests show up on Manager and Admin dashboards.
- Managers / Admins can **Approve** or **Reject** with review notes.
- Upon approval, the status reflects in the attendance record (`overtimeRequested = true`).

### 4. Attendance Validation (Anti-Spoofing / Audit)
- Managers (for their direct team) and Admins (system-wide) can inspect employee attendance cards.
- Clicking an employee's selfie opens a full-screen zoom preview to verify identity and workplace presence.
- Managers can mark the punch as **Valid** or **Invalid (Fake/Suspicious)** and attach remarks.

### 5. Role-Scoped Dashboards & Reports
- **Employee Dashboard**: Live digital clock, today's punch status, working hours counter, last 7 days history, and overtime status.
- **Manager Dashboard**: Overview of team members, count of present employees today, pending validations list, and quick actions.
- **Admin Dashboard**: System-wide statistics (total users, active employees, present count, pending validations), system attendance feed, and complete user management CRUD.
- **Daily Attendance Report**: Filter by date range, role-scoped (employees see their own; managers see their team; admins see all employees). Shows name, department, punch in/out, selfie, coordinates, hours, and status.

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Node.js** (v18.x or later)
- **MongoDB** (local MongoDB instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=attendx_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```
*(Or install manually: `cd server && npm install` and `cd client && npm install`)*

### 4. Seed Demo Data
Run the built-in database seed script to populate test accounts for Admin, Manager, and Employee:
```bash
npm run seed
# Or: cd server && npm run seed
```

### 5. Start the Application

**Run Backend (Port 5000):**
```bash
npm run dev:server
# Or: cd server && npm run dev
```

**Run Frontend (Port 5173):**
```bash
npm run dev:client
# Or: cd client && npm run dev
```

Open your browser and navigate to: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Credentials

All accounts share the default password: **`Password123!`**

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@attendx.com` | `Password123!` | System administrator with full access |
| **Manager** | `manager@attendx.com` | `Password123!` | Engineering manager with direct reports |
| **Employee** | `employee@attendx.com` | `Password123!` | Employee reporting to Manager Robert |
| **Employee 2** | `jane@attendx.com` | `Password123!` | Employee with a sample overtime request |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET  /api/auth/me` — Get authenticated user details

### Attendance
- `GET  /api/attendance/today` — Current user's status for today
- `POST /api/attendance/punch-in` — Punch in (selfie + location coordinates)
- `PUT  /api/attendance/punch-out` — Punch out (calculates shift duration)
- `GET  /api/attendance/my` — Employee's own attendance history
- `GET  /api/attendance/team` — Manager's direct team attendance
- `GET  /api/attendance/all` — Admin's view of all attendance records
- `PUT  /api/attendance/:id/validate` — Validate/invalidate attendance with remarks

### Overtime Requests
- `POST /api/overtime/request` — Employee submits overtime request
- `GET  /api/overtime/my` — Employee views personal overtime requests
- `GET  /api/overtime/pending` — Manager / Admin view pending requests
- `GET  /api/overtime/all` — Admin view of all overtime requests
- `PUT  /api/overtime/:id/review` — Approve or reject an overtime request

### Reports
- `GET  /api/reports/daily` — Role-scoped daily attendance summary

### User Management (Admin)
- `GET    /api/users` — List all users (paginated)
- `POST   /api/users` — Create user
- `PUT    /api/users/:id` — Update user
- `PATCH  /api/users/:id/toggle-status` — Activate/deactivate user
- `DELETE /api/users/:id` — Soft-delete user

---

## 💡 Assumptions Made

1. **Shift Schedule**: Standard workday shift is 8.0 hours. Punch-outs totaling ≥ 8 hours are marked `completed`; those under 8 hours are marked `incomplete`.
2. **Camera Verification**: To guarantee authenticity and prevent photo uploads from camera rolls, selfies are captured directly in the browser via `react-webcam` and encoded as base64 strings.
3. **Location Services**: Geolocation uses the HTML5 Geolocation API. In environments where GPS is unavailable or blocked, default coordinates or IP-based fallback are accepted.
4. **Data Isolation**: Managers are linked to employees via `managerId`. Managers only inspect and validate attendance records of employees assigned to them.
5. **Soft Deletion**: Admin user deletion sets `isActive = false`, preserving historical attendance and overtime records.

---

## 🌐 Production Deployment Guide

### Deploying Frontend (Vercel)
1. Push repository to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Configure Build Command: `npm run build` and Output Directory: `dist`.
5. Set Environment Variable: `VITE_API_URL=https://<your-backend-url>/api`.

### Deploying Backend (Render)
1. Create a **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `server`.
3. Set Build Command: `npm install` and Start Command: `node server.js`.
4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `PORT`: `5000` (or let Render set default).
