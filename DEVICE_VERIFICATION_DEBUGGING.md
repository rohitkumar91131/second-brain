# Device Verification Flow - Debugging & Testing Guide

## Issues Fixed

### 1. **OTP Verification - "User not found" Error**
**Problem:** After entering correct OTP, mobile app got "User not found" error.

**Root Cause:** 
- OTP verification stored `userId` in DeviceOtp record
- When user was retrieved by ID from DB, it failed silently
- No fallback mechanism to find user by email

**Fix Applied:**
- Added logging to track user lookup failures
- Added fallback: If user not found by ID, try finding by email from OTP record
- Added error message: "User not found - please register first" (more helpful)

**File:** `backend/routes/auth.js` - `/api/device/otp/verify` endpoint (Lines 127-195)

---

### 2. **QR Code Verification - "User not found" Error**
**Problem:** After scanning QR code, same "User not found" error occurred.

**Root Cause:** Same as OTP - no fallback user lookup by email.

**Fix Applied:**
- Same fix as OTP: Added fallback email lookup
- Added logging for debugging
- Improved error messages

**File:** `backend/routes/auth.js` - `/api/device/verify` endpoint (Lines 85-124)

---

### 3. **JWT Secret Inconsistency**
**Problem:** 
- Frontend uses `NEXTAUTH_SECRET` to verify JWT tokens
- Backend uses `JWT_SECRET` in some places
- If these values differ, token verification fails

**Fix Applied:**
- Updated all device verification endpoints to use: `NEXTAUTH_SECRET` with fallback to `JWT_SECRET`
- Updated auth middleware to handle both secrets
- Ensured consistency across:
  - `backend/routes/auth.js` - signToken() function
  - `backend/routes/device.js` - GET /api/device/verify/:requestId
  - `backend/middleware/auth.js` - requireAuth() function

**Files Changed:**
- `backend/routes/auth.js`
- `backend/routes/device.js`
- `backend/middleware/auth.js`

---

### 4. **Browser 500 Error - "Open in Browser"**
**Problem:** When opening verification URL in browser, got 500 error.

**Root Cause:** 
- GET `/api/device/verify/:requestId` endpoint had poor error handling
- No logging made debugging impossible
- User lookup failure caused unhandled exceptions

**Fix Applied:**
- Added comprehensive error logging
- Added fallback user lookup mechanism
- Better error messages with specific failure points
- Added JWT secret validation

**File:** `backend/routes/device.js` - GET `/api/device/verify/:requestId` endpoint (Lines 75-114)

---

## Testing Guide

### Prerequisites
```bash
# 1. Ensure .env files have matching JWT secrets
# In backend/.env or environment:
NEXTAUTH_SECRET=your_secret_here
JWT_SECRET=your_secret_here  # Should be same as NEXTAUTH_SECRET

# 2. MongoDB is running
# 3. Backend server is running
# 4. Next.js dev server is running
```

### Test 1: OTP Flow
```javascript
// 1. Create a test user (web registration)
// Register at: http://localhost:3000/register
// Email: test@example.com
// Password: Test123456

// 2. Generate OTP on web
// Go to: /dashboard/connect/otp
// Click "Generate OTP"
// Note the 6-digit OTP, e.g., "123456"

// 3. Test OTP verification from mobile/APK
// POST http://localhost:5000/api/auth/device/otp/verify
// Body:
{
  "email": "test@example.com",
  "otp": "123456",
  "deviceName": "Test Phone",
  "platform": "android",
  "deviceId": "unique-device-id-123"
}

// Expected Response (Success):
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "user_id",
    "name": "Test User",
    "email": "test@example.com",
    "image": null
  }
}

// Expected Response (Error):
{
  "error": "Invalid OTP" // If OTP doesn't match
  "error": "OTP has expired" // If OTP expired
  "error": "User not found - please register first" // If user doesn't exist
}
```

### Test 2: QR Code Flow
```javascript
// 1. Generate QR code on web
// Go to: /dashboard/connect/qr
// A QR code will be displayed

// 2. Get the token from browser console or DB
// POST http://localhost:3000/api/device/token (if endpoint exists)
// Or check MongoDB: db.deviceTokens.findOne()

// 3. Scan QR and test verification from mobile
// POST http://localhost:5000/api/device/verify
// Body:
{
  "token": "hex_token_from_qr",
  "deviceName": "My QR Phone",
  "platform": "ios",
  "deviceId": "unique-device-id-456"
}

// Expected Response: Same as OTP flow
```

### Test 3: Browser Device Approval
```javascript
// 1. Mobile initiates verification
// POST http://localhost:5000/api/device/verify/initiate
// Body:
{
  "deviceName": "My Phone",
  "platform": "android",
  "deviceId": "unique-device-id-789"
}

// Response:
{
  "requestId": "uuid-string",
  "verificationUrl": "http://localhost:3000/dashboard/device/adddevice?requestId=uuid-string",
  "expiresIn": 300
}

// 2. Open verificationUrl in browser
// You'll see: "Device Verification" page

// 3. If not logged in, login first
// Then click "Approve Device"

// 4. Backend processes approval
// POST http://localhost:3000/api/device/verify/[requestId]/approve
// (This is done by the frontend)

// 5. Check status from mobile
// GET http://localhost:5000/api/device/verify/[requestId]

// Expected Response (Pending):
{
  "status": "pending"
}

// Expected Response (Approved):
{
  "status": "approved",
  "accessToken": "eyJhbGc...",
  "user": {...}
}

// Expected Response (Expired):
{
  "status": "expired"
}
```

---

## Debugging Commands

### Check MongoDB Collections
```bash
# Connect to MongoDB
mongosh

# Switch to database
use second-brain

# Check DeviceOtp records
db.deviceotps.find()

# Check DeviceToken records
db.devicetokens.find()

# Check DeviceVerification records
db.deviceverifications.find()

# Check if user exists
db.users.findOne({ email: "test@example.com" })
```

### Check Backend Logs
```bash
# Backend console logs will show:
[OTP] OTP verified. Looking up user: 123abc...
[OTP] User verified: 123abc... (test@example.com)
[QR] Token verified. Looking up user: 456def...
[VERIFY] Verification not found: request-id

# If error occurs:
[OTP] User not found by ID (123abc), trying email fallback...
[QR] User not found for email: test@example.com
[VERIFY] User not found: 789ghi
```

### Test OTP Verification Manually
```bash
# 1. Get MongoDB connection string
MONGODB_URI="mongodb://localhost:27017/second-brain"

# 2. Insert test user
mongosh "mongodb://localhost:27017/second-brain" --eval "
db.users.insertOne({
  _id: ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  provider: 'credentials'
})
"

# 3. Generate test OTP
mongosh "mongodb://localhost:27017/second-brain" --eval "
db.deviceotps.insertOne({
  otp: '123456',
  userId: ObjectId('copy_user_id_from_above'),
  userEmail: 'test@example.com',
  expiresAt: new Date(Date.now() + 10*60*1000),
  isUsed: false
})
"

# 4. Test the endpoint
curl -X POST http://localhost:5000/api/auth/device/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "deviceName": "Test Phone",
    "platform": "android",
    "deviceId": "test-device-123"
  }' | jq
```

---

## Environment Variables Checklist

```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/second-brain
NEXTAUTH_SECRET=your_secret_key_here
JWT_SECRET=your_secret_key_here  # Should match NEXTAUTH_SECRET
WEB_APP_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# .env.local (Next.js)
NEXTAUTH_SECRET=your_secret_key_here  # MUST match backend
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/second-brain
API_BASE_URL=http://localhost:5000

# mobile/src/constants/config.js
export const API_BASE_URL = 'http://localhost:5000'
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "User not found" | User ID in OTP/Token record invalid or user deleted | Register user first, check user exists in DB |
| "Invalid OTP" | OTP doesn't match or already used | Generate new OTP, check it hasn't been used |
| "OTP has expired" | OTP older than 10 minutes | Generate new OTP |
| "Token has expired" | QR code token older than 10 minutes | Generate new QR code |
| 500 error in browser | JWT secret mismatch or missing configuration | Check NEXTAUTH_SECRET is set and matches backend |
| "Server configuration error" | JWT_SECRET or NEXTAUTH_SECRET not set | Set both environment variables to same value |
| Token verification fails | Different secrets in frontend vs backend | Ensure `NEXTAUTH_SECRET` is same in both |

---

## Files Modified

1. **backend/routes/auth.js**
   - Fixed `signToken()` to use NEXTAUTH_SECRET
   - Fixed `POST /api/device/otp/verify` with fallback user lookup
   - Fixed `POST /api/device/verify` with fallback user lookup

2. **backend/routes/device.js**
   - Fixed `GET /api/device/verify/:requestId` with JWT secret handling
   - Added logging for all error cases

3. **backend/middleware/auth.js**
   - Updated requireAuth() to use NEXTAUTH_SECRET with fallback

4. **app/api/device/verify/route.js** (Next.js)
   - Added logging and fallback user lookup

---

## Next Steps

1. Test all three flows (OTP, QR, Browser)
2. Monitor backend logs for any errors
3. If user still gets "User not found":
   - Check MongoDB for user and OTP/Token records
   - Verify email matches exactly (case-sensitive in some comparisons)
   - Ensure user ID in OTP record matches a real user in DB
4. If 500 error persists:
   - Check NEXTAUTH_SECRET is set
   - Check MongoDB connection
   - Check backend server logs
