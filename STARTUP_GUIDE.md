# Backend Connection Fix - Startup Guide

## ✅ What Was Fixed

### Issue
Dashboard showed "Backend not responding - Failed to fetch" error with constant console spam.

### Root Cause  
Backend was loading the **wrong `.env` file**, causing:
- Missing Supabase configuration
- Missing SMTP settings
- Supabase client initialization failures

### Changes Made
1. ✅ **Backend .env loading** - Fixed path from `../../.env` to `../. env`
2. ✅ **Frontend retry logic** - Added automatic retry with exponential backoff
3. ✅ **Better error messages** - Clear troubleshooting guidance instead of "Failed to fetch"
4. ✅ **Reduced error spam** - Silent fallback in production mode
5. ✅ **SMTP configuration** - Added to backend/.env

---

## 🚀 How to Start the System

### 1. Kill Any Running Processes
```powershell
# Close any terminal windows running the backend/frontend
# OR use:
Get-Process node | Stop-Process -Force
```

### 2. Verify Configuration Files
Check these files exist and have values:

**Frontend:**
- `d:\UST\3rd Year\TRIBE\Admin - Web\.env` ✓

**Backend:**
- `d:\UST\3rd Year\TRIBE\Admin - Web\backend\.env` ✓
- Should contain: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_HOST`, etc.

### 3. Start Both Services
```powershell
# From project root
cd "d:\UST\3rd Year\TRIBE\Admin - Web"
.\start-all.ps1
```

### 4. Wait for Backend Startup
You should see:
```
✅ Backend Server Running!
   URL: http://localhost:5000
   Health: http://localhost:5000/api/health
✨ Backend is ready to receive requests
```

### 5. Access Dashboard
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/
- Health Check: http://localhost:5000/api/health

---

## 🔍 Troubleshooting

### Problem: "Backend not responding" on Dashboard
**Solution:**
1. Check backend terminal - look for startup errors
2. Verify backend/.env has all required variables
3. Wait 5 seconds for backend to fully start
4. Refresh the page

### Problem: Port 5000 Already in Use
**Solution:**
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Get-Process

# Kill it
Get-Process -Id [PID] | Stop-Process -Force
```

### Problem: Dashboard shows "-" for all metrics
**Solution:**
- Check browser devtools for errors (F12 → Console)
- Verify health endpoint works: http://localhost:5000/api/health
- Restart backend

### Problem: Supabase Connection Error
**Solution:**
1. Check backend/.env exists
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Check for typos in .env file
4. Restart backend

---

## 📊 System Health Check

Run this to verify everything is working:

```powershell
# Test Frontend (should return HTML)
curl http://localhost:3000

# Test Backend Health (should return {"status":"ok",...})
curl http://localhost:5000/api/health

# Test Dashboard Metrics (requires auth token)
curl -H "Authorization: Bearer <your_token>" http://localhost:5000/api/dashboard/metrics
```

---

## 🔐 Environment Variables Checklist

### Frontend (.env)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`

### Backend (backend/.env)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`

---

## 💡 Development Tips

### Enable More Detailed Logging
In `backend/src/main.ts`, errors and startup steps are logged in color. Read them carefully!

### Silent Mode (Production)
Dashboard errors are only shown in development. In production, it silently falls back to `-` values while still logging backend issues. This prevents user confusion.

### Auto-Retry
Frontend now retries failed requests up to 3 times with exponential backoff (500ms → 1s → 2s). This handles slow backend startup gracefully.

---

## 🆘 Still Having Issues?

Check the logs:

```powershell
# Backend terminal - look for:
# ✅ = Success
# ❌ = Error  
# 🔧 = Configuration
# 🗄️  = Database
# 📧 = Email
# 🚀 = Startup
```

If you see `❌ Failed to start backend`, the error message will explain what's missing.
