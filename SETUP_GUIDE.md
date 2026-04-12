# HopeCard Admin Portal - Complete Setup Guide

## Prerequisites
- **Node.js 18.x** or later
- **Supabase Account** (free tier available at supabase.com)
- **Gmail Account** (for sending OTP emails)

---

## 1️⃣ Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Copy these keys from Project Settings → API:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Create Database Tables
Run these SQL queries in Supabase SQL Editor:

```sql
-- Admins table
CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- OTP Sessions table
CREATE TABLE otp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  expires_at_ms bigint NOT NULL,
  created_at_ms bigint DEFAULT EXTRACT(epoch FROM now())::bigint * 1000,
  used boolean DEFAULT false
);

-- Activity Logs table (optional)
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id),
  action text,
  details jsonb,
  created_at timestamp DEFAULT now()
);
```

### Create Test Admin User
1. Go to **Authentication** → **Users**
2. Click "Create new user"
3. Enter: `admin@hopecard.com` and password `admin123`
4. Go to **SQL Editor** and run:
```sql
INSERT INTO admins (email, name, password_hash)
VALUES ('admin@hopecard.com', 'Admin User', 'admin123');
```

---

## 2️⃣ Gmail Setup (for OTP emails)

### Generate App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Enable **2-Factor Authentication**
3. Go to **App passwords** (appears after 2FA enabled)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password shown

---

## 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd "path/to/Admin - Web"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_BACKEND_URL (keep as http://localhost:5000)

# Start frontend
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 4️⃣ Backend Setup

```bash
# Navigate to backend directory
cd "path/to/Admin - Web/backend"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_ANON_KEY
# - FRONTEND_URL (keep as http://localhost:3000)
# - GMAIL_EMAIL (your Gmail)
# - GMAIL_APP_PASSWORD (the 16-character password from step 2)

# Start backend
npm run dev
```

Backend runs on: **http://localhost:5000**

---

## 5️⃣ Test the Application

### Login Flow
1. Open **http://localhost:3000** in your browser
2. Enter credentials:
   - Email: `admin@hopecard.com`
   - Password: `admin123`
3. You should receive OTP email at `admin@hopecard.com`
4. Enter 6-digit code to verify

### Troubleshooting

**OAuth won't receive OTP?**
- ✅ Check backend .env has GMAIL_EMAIL and GMAIL_APP_PASSWORD
- ✅ Check backend is running (http://localhost:5000)
- ✅ Check frontend .env has NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
- ✅ Open browser console (F12) for error messages

**Backend won't start?**
- ✅ Run `npm install` in backend folder
- ✅ Check .env file exists with all required values
- ✅ Verify Supabase keys are correct

**Wrong database values?**
- ✅ Run SQL queries again to check tables exist
- ✅ Go to Supabase Dashboard → SQL Editor → Run queries

---

## 📁 Final .env.local Example (Frontend)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
JWT_SECRET=hopecard-admin-secret-key-change-in-production
```

## 📁 Final .env Example (Backend)

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRONTEND_URL=http://localhost:3000
JWT_SECRET=hopecard-admin-secret-key-change-in-production
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🚀 Running Both Servers (Windows)

### Option 1: Manual (Two Terminals)

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Option 2: Automatic (PowerShell)
```bash
.\start-all.ps1
```

---

## ✅ Verification Checklist
- [ ] Supabase project created with URL and keys
- [ ] Database tables created
- [ ] Test admin user created
- [ ] Gmail 2FA enabled and app password generated
- [ ] Frontend .env.local created with correct values
- [ ] Backend .env created with correct values
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can login with admin@hopecard.com / admin123
- [ ] Receive OTP email
- [ ] Login successful after OTP verification
