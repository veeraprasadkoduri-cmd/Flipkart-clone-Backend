# 🛒 Flipkart Clone — Full-Stack Authentication System

A complete authentication system with React frontend + Node.js/Express backend + MariaDB database.

---

## 📁 Project Structure

```
flipkart-auth/
├── backend/
│   ├── controllers/
│   │   └── authController.js   # All business logic
│   ├── routes/
│   │   └── auth.js             # API route definitions + JWT middleware
│   ├── db.js                   # MariaDB pool + auto-init
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js  # Global auth state (React Context)
│       ├── components/
│       │   ├── Navbar.js
│       │   └── ProtectedRoute.js
│       ├── pages/
│       │   ├── Signup.js
│       │   ├── Login.js
│       │   ├── VerifyOTP.js
│       │   └── Dashboard.js
│       ├── App.js
│       ├── index.js
│       └── index.css           # Flipkart-themed design system
├── setup.sql                   # Database + table creation SQL
└── README.md
```

---

## ✅ Prerequisites

- **Node.js** v16+ and npm
- **MariaDB** (or MySQL) running locally
- **Gmail account** with an App Password (for OTP emails)

---

## ⚡ Quick Start

### Step 1 — Clone / Extract the project

```bash
cd flipkart-auth
```

### Step 2 — Set up the Database

**Option A** — Run the SQL script:
```bash
mysql -u root -p < setup.sql
```

**Option B** — Auto-init (the server does this automatically on first run using `db.js`).

---

### Step 3 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mariadb_password
DB_NAME=flipkart_clone

JWT_SECRET=change_this_to_a_long_random_string

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```

> **Gmail App Password Setup:**
> 1. Go to https://myaccount.google.com/security
> 2. Enable **2-Step Verification**
> 3. Go to **App passwords** → Select "Mail" → Generate
> 4. Copy the 16-character password into `EMAIL_PASS`

---

### Step 4 — Install & Run Backend

```bash
# Inside /backend
npm install
npm run dev        # development (nodemon)
# OR
npm start          # production
```

Backend runs at: **http://localhost:5000**

---

### Step 5 — Install & Run Frontend

```bash
# Inside /frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in `frontend/package.json` routes all `/api/*` calls to the backend automatically.

---

## 🔌 API Endpoints

| Method | Endpoint              | Auth Required | Description               |
|--------|-----------------------|---------------|---------------------------|
| POST   | `/api/auth/signup`    | No            | Register new user         |
| POST   | `/api/auth/verify-otp`| No            | Verify email OTP          |
| POST   | `/api/auth/resend-otp`| No            | Resend OTP                |
| POST   | `/api/auth/login`     | No            | Login (returns JWT)       |
| GET    | `/api/auth/profile`   | Yes (Bearer)  | Get logged-in user profile|

### Request/Response Examples

**POST /api/auth/signup**
```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }

// Response 201
{ "message": "Account created! OTP sent to your email.", "email": "john@example.com" }
```

**POST /api/auth/verify-otp**
```json
// Request
{ "email": "john@example.com", "otp": "847291" }

// Response 200
{ "message": "Email verified successfully! You can now login." }
```

**POST /api/auth/login**
```json
// Request
{ "email": "john@example.com", "password": "secret123" }

// Response 200
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

**GET /api/auth/profile** *(Bearer token required)*
```json
// Response 200
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_verified": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(100)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,        -- bcrypt hashed
  is_verified BOOLEAN       DEFAULT FALSE,
  otp         VARCHAR(6)    DEFAULT NULL,    -- cleared after verification
  otp_expiry  DATETIME      DEFAULT NULL,    -- 5-min window
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcryptjs (12 salt rounds) |
| JWT Auth | 7-day expiry, signed with secret |
| OTP Expiry | 5-minute window, cleared after use |
| Email Uniqueness | DB UNIQUE constraint + app-level check |
| Login Guard | Blocks unverified accounts |
| CORS | Restricted to frontend origin |

---

## 🎨 UI Pages

| Route | Page | Description |
|-------|------|-------------|
| `/signup` | Signup | Name, Email, Password form |
| `/verify-otp` | OTP Verification | 6-digit input with paste support + countdown resend |
| `/login` | Login | Email + Password, shows verify link if unverified |
| `/dashboard` | Dashboard | Welcome message, user info, quick links |

---

## 🚀 Production Notes

- Set `NODE_ENV=production` in your `.env`
- Use a strong, random `JWT_SECRET` (32+ chars)
- Add HTTPS via a reverse proxy (Nginx/Caddy)
- Store secrets in environment variables, never commit `.env`
- Consider rate-limiting `/signup` and `/login` with `express-rate-limit`
