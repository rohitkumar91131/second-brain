# Environment Setup - Complete Checklist

## ⚙️ Environment Variables - CRITICAL

### These MUST be set and MUST match!

```bash
# 1. backend/.env
MONGODB_URI=mongodb://localhost:27017/second-brain
NEXTAUTH_SECRET=your_secret_key_here_minimum_32_chars
JWT_SECRET=your_secret_key_here_minimum_32_chars  ← MUST MATCH NEXTAUTH_SECRET!
WEB_APP_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development

# 2. .env.local (Next.js root)
NEXTAUTH_SECRET=your_secret_key_here_minimum_32_chars  ← SAME as backend!
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/second-brain
API_BASE_URL=http://localhost:5000

# 3. mobile/.env (if exists) or constants/config.js
API_BASE_URL=http://localhost:5000
```

## ✅ Verification Checklist

### 1. Check Secrets Match
```bash
# Run this command to verify:
echo "Backend NEXTAUTH_SECRET:"
grep "NEXTAUTH_SECRET" backend/.env

echo "Frontend NEXTAUTH_SECRET:"
grep "NEXTAUTH_SECRET" .env.local

# If output is DIFFERENT → Fix it!
# They MUST have the same value
```

### 2. MongoDB Connection
```bash
# Verify MongoDB is running:
mongosh

# You should see: "Current Mongosh DB version: ..."

# Switch to correct database:
use second-brain

# Check if collections exist:
show collections

# If empty, that's OK (will be created when needed)

# Exit:
exit
```

### 3. Start Services

#### Terminal 1: MongoDB
```bash
# If MongoDB installed locally:
mongod

# You should see: "Waiting for connections on port 27017"

# If using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Terminal 2: Backend (Node.js)
```bash
cd backend
npm install  # First time only
npm start    # or: node server.js

# You should see:
# ✓ Backend running on http://localhost:5000
# ✓ Connected to MongoDB
```

#### Terminal 3: Frontend (Next.js)
```bash
# From root directory
npm install  # First time only
npm run dev

# You should see:
# ✓ Frontend running on http://localhost:3000
# ✓ Ready in Xs
```

#### Terminal 4: Mobile (if testing APK)
```bash
cd mobile
npm install  # First time only
npm start    # or: npx expo start
```

## 🧪 Quick Verification Tests

### Test 1: MongoDB Connection
```bash
curl -X GET http://localhost:5000/api/health

# Expected: 200 OK (or similar success response)
# If fails: Check MongoDB is running
```

### Test 2: Backend JWT Secret
```bash
# Check backend can start without errors:
# Look for error: "JWT_SECRET or NEXTAUTH_SECRET not configured"
# If no error → Secrets are set correctly
```

### Test 3: Frontend JWT Secret  
```bash
# Open browser DevTools Console:
# http://localhost:3000

# No errors like "NEXTAUTH_SECRET is not defined"?
# → Frontend secrets are set correctly
```

### Test 4: Full OTP Flow
```bash
# 1. Register: http://localhost:3000/register
# Email: test@example.com
# Password: Test12345

# 2. Login with same credentials
# You're now logged in ✓

# 3. Go to: /dashboard/connect/otp
# Click "Generate OTP"
# Note the 6-digit code, e.g., "123456"

# 4. Test with curl:
curl -X POST http://localhost:5000/api/auth/device/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "deviceName": "Test Phone",
    "platform": "android",
    "deviceId": "test-device-12345"
  }' | jq .

# Expected response:
# {
#   "accessToken": "eyJhbGc...",
#   "user": {
#     "id": "...",
#     "name": "Test User",
#     "email": "test@example.com",
#     "image": null
#   }
# }

# NOT: { "error": "User not found" }
```

## 🔧 Common Setup Issues

### Issue: "JWT_SECRET or NEXTAUTH_SECRET not configured"
**Solution:**
```bash
# Edit backend/.env
NEXTAUTH_SECRET=your_secret_123_at_least_32_chars_here
JWT_SECRET=your_secret_123_at_least_32_chars_here

# Save and restart backend:
npm start
```

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check MongoDB is running:
mongosh

# If fails → Start MongoDB:
# On Mac:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
net start MongoDB

# Or use Docker:
docker run -d -p 27017:27017 mongo:latest
```

### Issue: "NEXTAUTH_SECRET does not match"
**Solution:**
```bash
# Ensure both files have same value:
# 1. backend/.env:
NEXTAUTH_SECRET=abc123def456ghi789jkl012...

# 2. .env.local:
NEXTAUTH_SECRET=abc123def456ghi789jkl012...  ← EXACTLY the same!

# Restart both servers:
# Terminal 2: Ctrl+C, then npm start
# Terminal 3: Ctrl+C, then npm run dev
```

### Issue: "Port 5000 is already in use"
**Solution:**
```bash
# Kill process using port 5000:

# On Mac/Linux:
lsof -i :5000
kill -9 <PID>

# Or change port in backend/server.js:
const PORT = 5001  // Change to different port
// Then update frontend .env:
API_BASE_URL=http://localhost:5001
```

### Issue: "Port 3000 is already in use"
**Solution:**
```bash
# Kill process using port 3000:

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Or change port:
npm run dev -- -p 3001
```

## 📋 Final Setup Checklist

### Before Testing Any Flows:
- [ ] MongoDB running on port 27017
- [ ] Backend running on port 5000  
- [ ] Frontend running on port 3000
- [ ] `NEXTAUTH_SECRET` set in backend/.env
- [ ] `NEXTAUTH_SECRET` set in .env.local
- [ ] Both `NEXTAUTH_SECRET` values are IDENTICAL
- [ ] `JWT_SECRET` set in backend/.env (same as NEXTAUTH_SECRET)
- [ ] `API_BASE_URL=http://localhost:5000` in .env.local
- [ ] `MONGODB_URI=mongodb://localhost:27017/second-brain` in both
- [ ] Backend console shows "Connected to MongoDB"
- [ ] Frontend shows "Ready in Xs"

### After Setup:
- [ ] Can register a user: http://localhost:3000/register
- [ ] Can login: http://localhost:3000/login
- [ ] Can generate OTP: /dashboard/connect/otp
- [ ] Can test OTP verification: (see Test 4 above)
- [ ] Backend logs show `[OTP] User verified: ...` (no errors)

### If ALL checks pass:
✅ You're ready to test all device verification flows!

---

## 🚀 Quick Start Script

Save as `setup.sh` and run:
```bash
#!/bin/bash

echo "Starting Second Brain Device Verification Setup..."

# 1. Check MongoDB
echo "✓ Checking MongoDB..."
if ! mongosh --eval "db.version()" > /dev/null 2>&1; then
  echo "❌ MongoDB not running. Start it first:"
  echo "  mongod  (or: docker run -d -p 27017:27017 mongo:latest)"
  exit 1
fi

# 2. Start Backend
echo "✓ Starting Backend..."
cd backend || exit 1
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!
sleep 3

# 3. Start Frontend
echo "✓ Starting Frontend..."
cd ..
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
sleep 5

# 4. Verify Setup
echo "✓ Verifying Setup..."
if curl -s http://localhost:5000/ > /dev/null; then
  echo "✅ Backend running on http://localhost:5000"
else
  echo "❌ Backend not responding"
fi

if curl -s http://localhost:3000/ > /dev/null; then
  echo "✅ Frontend running on http://localhost:3000"
else
  echo "❌ Frontend not responding"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Open your browser and go to: http://localhost:3000"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID"
echo "  kill $FRONTEND_PID"
```

## 📞 Still Having Issues?

### Check these in order:
1. **Environment Variables:**
   ```bash
   echo $NEXTAUTH_SECRET
   grep NEXTAUTH_SECRET backend/.env
   ```

2. **MongoDB Connection:**
   ```bash
   mongosh
   use second-brain
   db.users.find()
   exit
   ```

3. **Service Status:**
   ```bash
   curl http://localhost:5000/
   curl http://localhost:3000/
   ```

4. **Backend Logs:**
   - Look for: `Connected to MongoDB` ← Should appear on start
   - Look for: `[OTP] User verified: ...` ← Should appear when testing

5. **Check for Typos:**
   - Case-sensitive: `NEXTAUTH_SECRET` not `nextauth_secret`
   - No spaces around `=`
   - No quotes around values

---

## 🎯 Success Indicators

When setup is correct, you should see:

**Backend Console:**
```
✓ Backend running on http://localhost:5000
✓ Connected to MongoDB
```

**Frontend Console:**
```
✓ Frontend ready in 2.5s
✓ Routes are ready to be served
```

**MongoDB:**
```
Waiting for connections on port 27017
```

**Browser (http://localhost:3000):**
- No errors in DevTools Console
- Can navigate to `/register` and `/login`
- Can reach `/dashboard` when logged in

**After OTP Test:**
- Backend logs show: `[OTP] User verified: 123abc... (email@example.com)`
- Mobile/curl gets: `{ "accessToken": "...", "user": {...} }`
- NOT: `{ "error": "User not found" }`

---

That's it! Once all checks pass, you're ready to test all device verification flows.
