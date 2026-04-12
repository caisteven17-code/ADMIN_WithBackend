# 🔧 Troubleshooting Guide - HopeCard Admin System

## ❌ Error: "Failed to fetch" on Dashboard

### Quick Diagnosis Steps

#### 1. **Check if Backend is Running**
```bash
# Open terminal and test:
curl http://localhost:5000/api/health

# You should see:
# {"status":"ok","message":"Backend is running","timestamp":"2026-04-12T..."}
```

If this fails, the backend is not running:
- Ensure you ran `npm run dev` in the `backend/` folder
- Check if port 5000 is already in use: `netstat -an | findstr :5000`

#### 2. **Check Browser Console (F12)**
- Open Developer Tools: Press `F12`
- Go to **Console** tab
- Look for logs starting with 🏥, 🔍, ❌, etc.

**Success logs look like:**
```
🏥 Checking backend health...
✅ Backend is healthy: {status: 'ok', message: 'Backend is running', timestamp: '...'}
🔍 Fetching from: http://localhost:5000/api/dashboard/metrics
🔐 Using token: ✓ Present
📊 Response status: 200 OK
📊 Response data: {success: true, data: {...}}
```

**Failure logs look like:**
```
⚠️ Backend health check failed: Failed to fetch
❌ Error fetching dashboard metrics: Backend not responding
```

#### 3. **Check JWT Token**
- F12 → **Application** tab
- Left sidebar → **Local Storage**
- Look for `admin_token` entry
- If missing, you need to login again with OTP

#### 4. **Check Backend .env**
Verify `backend/.env` has these lines:
```
JWT_SECRET=hopecard-admin-secret-key-change-in-production
NODE_ENV=development
```

---

## 🚀 Step-by-Step Fix Guide

### Step 1: Stop Everything
```bash
# Kill all node processes
# On Windows PowerShell:
Get-Process node | Stop-Process -Force

# Or manually close terminals
```

### Step 2: Clear Cache
1. Open browser
2. Press `Ctrl + Shift + Delete`
3. Select "All time" and "Cookies and other site data"
4. Click "Clear data"

### Step 3: Restart Backend First
```bash
cd backend
npm install  # If node_modules are missing
npm run dev
```

Wait for this message:
```
✅ NestJS Backend running on http://localhost:5000
```

### Step 4: Restart Frontend (New Terminal)
```bash
cd path/to/Admin\ -\ Web  # Root directory
npm run dev
```

Wait for:
```
Ready in Xs
```

### Step 5: Test in Browser
1. Go to `http://localhost:3000/login`
2. Enter your credentials and complete OTP
3. You should be redirected to `/dashboard`
4. **Open F12 Console** and check logs

---

## 🔍 Common Errors

### Error: `Failed to fetch` (No Details)
**Cause:** Backend not running or not responding
```
FIX:
1. Check if backend process is running
2. Verify port 5000 is available
3. Check backend terminal for errors
```

### Error: `Backend error (401): Invalid or expired JWT token`
**Cause:** JWT token is invalid or expired
```
FIX:
1. Login again with OTP (this creates new token)
2. Clear localStorage and reload page
3. Try in incognito mode
```

### Error: `Backend error (401): No JWT token provided`
**Cause:** Token not being sent with request
```
FIX:
1. Check localStorage has admin_token (F12 → Application)
2. Login again
3. Check browser's CORS settings
```

### Error: `Backend returned 500: Internal Server Error`
**Cause:** Backend has an unhandled error
```
FIX:
1. Check backend terminal console for error
2. Look for Supabase connection errors
3. Verify backend .env has all required variables
```

### Error: `timeout` - Request taking too long
**Cause:** Backend is slow or hanging
```
FIX:
1. Restart backend
2. Check if Supabase is accessible
3. Check backend console logs for stuck operations
```

---

## 📋 Verification Checklist

- [ ] Backend running on port 5000 (`npm run dev` in backend/)
- [ ] Frontend running on port 3000 (`npm run dev` in root)
- [ ] Can open http://localhost:3000 in browser
- [ ] Can login with credentials
- [ ] Dashboard loads with stats
- [ ] Browser F12 console shows no red errors related to dashboard fetch
- [ ] Backend terminal shows logs with 📊 emoji (dashboard endpoint hit)

---

## 🆘 Advanced Debugging

### View Backend Logs
- Backend terminal will show detailed logs with emoji indicators:
  - 🔑 = JWT Guard checking tokens
  - 📊 = Dashboard endpoint accessed
  - ❌ = Errors occurred
  - ✅ = Success messages

### Check Network Requests
1. F12 → **Network** tab
2. Login to dashboard
3. Look for request to: `http://localhost:5000/api/dashboard/metrics`
4. Check:
   - **Status Code**: Should be 200 (if working) or 401 (if token invalid)
   - **Response**: Should have `{"success": true, "data": {...}}`
   - **Request Headers**: Should have `Authorization: Bearer YOUR_TOKEN`

### Manual API Test
```bash
# 1. Get your JWT token (from browser localStorage)
# 2. Test with curl:
curl -X GET http://localhost:5000/api/dashboard/metrics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Should return:
# {"success":true,"data":{"totalBeneficiaries":...}}
```

---

## ✅ Solution Applied (April 12, 2026)

The following fixes were implemented:

1. **Global Exception Filter** - Ensures backend errors return proper JSON format
2. **Enhanced JWT Guard** - Better error messages for token issues
3. **Improved Frontend Error Handling** - Shows detailed debug messages
4. **Backend Health Check** - Frontend tests backend connectivity first
5. **JWT_SECRET in .env** - Explicit configuration instead of relying on defaults

These changes ensure that any backend errors are properly formatted and returned, preventing the generic "Failed to fetch" message.

---

## 📞 Still Not Working?

1. **Check Supabase Connection**: Are the database credentials correct?
2. **Check Node Version**: `node --version` (should be 18+)
3. **Check NPM Packages**: Try `npm install` in both root and backend folders
4. **Firewall/Network**: Is localhost:5000 accessible?
5. **Port Conflicts**: Is another app using port 5000 or 3000?

Try using the `start-all.ps1` script:
```bash
PowerShell -ExecutionPolicy Bypass -File ./start-all.ps1
```

This will start both backend and frontend in separate terminals.
