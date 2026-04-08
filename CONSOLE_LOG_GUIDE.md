# Console Logging Guide - Sign-In Flows

## Overview
Comprehensive console logging has been added to all authentication flows. Each flow uses a prefix `[FLOW_NAME]` for easy grepping and debugging.

---

## 1. LOGIN Flow (Username/Password)
**Endpoint:** `POST /api/auth/login`
**File:** `backend/routes/auth.js`

### Console Output:
```
[LOGIN] Request received
[LOGIN] Email: user@example.com
[LOGIN] Connecting to database...
[LOGIN] Database connected
[LOGIN] Looking up user with email: user@example.com
[LOGIN] Comparing passwords...
[LOGIN] Password valid. Generating token for user: 507f1f77bcf86cd799439011
[LOGIN] Login successful for: user@example.com
```

### Debug Points:
- `User not found: user@example.com` → User doesn't exist in DB
- `User has no password set: user@example.com` → User exists but no password
- `Password mismatch for: user@example.com` → Wrong password entered

---

## 2. REGISTER Flow (New User)
**Endpoint:** `POST /api/auth/register`
**File:** `backend/routes/auth.js`

### Console Output:
```
[REGISTER] Request received
[REGISTER] Email: newuser@example.com Name: John Doe
[REGISTER] Connecting to database...
[REGISTER] Database connected
[REGISTER] Checking if email already exists: newuser@example.com
[REGISTER] Hashing password...
[REGISTER] Creating user...
[REGISTER] User created: 507f1f77bcf86cd799439011 newuser@example.com
[REGISTER] Generating access token...
[REGISTER] Registration successful for: newuser@example.com
```

### Debug Points:
- `Missing required fields` → Name, email, or password missing
- `Password too short` → Password < 8 characters
- `Email already registered: newuser@example.com` → User already exists

---

## 3. QR CODE Device Verification (APK from Website QR)
**Endpoint:** `POST /api/auth/device/verify`
**File:** `backend/routes/auth.js`

### Console Output:
```
[QR VERIFY] Request received
[QR VERIFY] DeviceID: abc123xyz Platform: android
[QR VERIFY] Connecting to database...
[QR VERIFY] Database connected
[QR VERIFY] Looking up token: 64f8a2b7e4c...
[QR VERIFY] Token found. Checking expiry...
[QR VERIFY] Token valid. Looking up user: 507f1f77bcf86cd799439011
[QR VERIFY] User verified: 507f1f77bcf86cd799439011 (user@example.com)
[QR VERIFY] Marking token as used...
[QR VERIFY] Token marked as used
[QR VERIFY] Creating/updating device...
[QR VERIFY] Device created/updated: 507f1f77bcf86cd799439012
[QR VERIFY] Generating access token...
[QR VERIFY] QR verification successful for user: user@example.com
```

### Debug Points:
- `Token not found or already used: 64f8a2b7e4c...` → QR token invalid/expired
- `Token expired: 64f8a2b7e4c...` → QR token beyond 10-minute window
- `User not found by ID (507f1f77bcf86cd799439011), trying email fallback...` → Fallback logic triggered
- `User not found for ID: 507f1f77bcf86cd799439011, email: user@example.com` → **User not found error**

---

## 4. OTP-Based Device Verification (APK manual OTP)
**Endpoint:** `POST /api/auth/device/otp/verify`
**File:** `backend/routes/auth.js`

### Console Output:
```
[OTP VERIFY] Request received
[OTP VERIFY] Email: user@example.com OTP: 123456 DeviceID: abc123xyz
[OTP VERIFY] Connecting to database...
[OTP VERIFY] Database connected
[OTP VERIFY] Looking up OTP record for email: user@example.com OTP: 123456
[OTP VERIFY] OTP record found: 507f1f77bcf86cd799439013
[OTP VERIFY] Checking OTP expiry...
[OTP VERIFY] OTP is valid (not expired)
[OTP VERIFY] OTP verified. Looking up user: 507f1f77bcf86cd799439011
[OTP VERIFY] User verified: 507f1f77bcf86cd799439011 (user@example.com)
[OTP VERIFY] Marking OTP as used...
[OTP VERIFY] OTP marked as used
[OTP VERIFY] Creating/updating device...
[OTP VERIFY] Device created/updated: 507f1f77bcf86cd799439012
[OTP VERIFY] Generating access token...
[OTP VERIFY] OTP verification successful for user: user@example.com
```

### Debug Points:
- `Missing email, otp, or deviceId` → Required fields missing
- `Invalid OTP format: abc` → OTP not 6 digits
- `OTP not found for email: user@example.com, otp: 123456` → **Invalid OTP error**
- `OTP expired for user@example.com` → OTP beyond 10-minute window
- `User not found for email: user@example.com` → **User not found error after OTP validates**

---

## 5. Device Verification Initiate (Browser)
**Endpoint:** `POST /api/device/verify/initiate`
**File:** `backend/routes/device.js`

### Console Output:
```
[DEVICE INITIATE] Request received
[DEVICE INITIATE] Device: { deviceName: 'My iPhone', platform: 'ios', deviceId: 'xyz789' }
[DEVICE INITIATE] Connecting to database...
[DEVICE INITIATE] Database connected
[DEVICE INITIATE] Creating verification record...
[DEVICE INITIATE] Verification record created: 550e8400-e29b-41d4-a716-446655440000
[DEVICE INITIATE] Verification URL generated: https://app.example.com/dashboard/device/adddevice?requestId=550e8400-e29b-41d4-a716-446655440000
[DEVICE INITIATE] Initiate successful
```

### Debug Points:
- `Missing deviceName or deviceId` → Required fields missing
- `WEB_APP_URL environment variable is not set` → **500 Error** - Missing env var

---

## 6. Device Verification Status Check (APK polling)
**Endpoint:** `GET /api/device/verify/:requestId`
**File:** `backend/routes/device.js`

### Console Output:
```
[DEVICE STATUS CHECK] Request ID: 550e8400-e29b-41d4-a716-446655440000
[DEVICE STATUS CHECK] Connecting to database...
[DEVICE STATUS CHECK] Database connected
[DEVICE STATUS CHECK] Looking up verification record...
[DEVICE STATUS CHECK] Verification record found. Status: pending
[DEVICE STATUS CHECK] Checking expiry...
[DEVICE STATUS CHECK] Request still valid
[DEVICE STATUS CHECK] Current status: pending
```

### When Approved:
```
[DEVICE STATUS CHECK] Request is approved. Looking up user: 507f1f77bcf86cd799439011
[DEVICE STATUS CHECK] User found: user@example.com
[DEVICE STATUS CHECK] Generating access token...
[DEVICE STATUS CHECK] Access token generated. Sending response...
```

### Debug Points:
- `Missing request ID` → RequestId not provided
- `Verification not found: 550e8400-e29b...` → RequestId doesn't exist
- `Request expired` → 5-minute window exceeded
- `User not found: 507f1f77bcf86cd799439011` → **500 Error** when trying to approve
- `No JWT secret configured` → **500 Error** - Missing NEXTAUTH_SECRET

---

## How to Debug

### View All Sign-In Logs:
```bash
# Backend console (npm run dev in backend/)
grep "\[LOGIN\]\|\[REGISTER\]\|\[QR VERIFY\]\|\[OTP VERIFY\]" backend-console.log
```

### View Device Verification Logs:
```bash
grep "\[DEVICE INITIATE\]\|\[DEVICE STATUS CHECK\]" backend-console.log
```

### Find Errors:
```bash
# Look for error logs
grep "error:" backend-console.log

# Look for specific flow errors
grep "\[OTP VERIFY\] Error:" backend-console.log
```

---

## Common Issues & Solutions

| Issue | Console Log | Solution |
|-------|-------------|----------|
| User not found after OTP | `[OTP VERIFY] User not found for email` | User wasn't registered before attempting OTP |
| User not found after QR | `[QR VERIFY] User not found for ID` | User ID mismatch or deleted user |
| Token already used | `[QR VERIFY] Token not found or already used` | QR code scanned twice or token expired |
| OTP expired | `[OTP VERIFY] OTP is valid (not expired)` ❌ shows before expiry check | OTP was used more than 10 min ago |
| 500 Error on device verify | Check for `No JWT secret configured` | Ensure NEXTAUTH_SECRET is set in .env |
| 500 Error on initiate | Check for `WEB_APP_URL environment variable is not set` | Add WEB_APP_URL to .env |

---

## Testing Commands

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test OTP Verify:
```bash
curl -X POST http://localhost:5000/api/auth/device/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","deviceId":"abc123","deviceName":"MyPhone"}'
```

### Test Device Verify:
```bash
curl -X POST http://localhost:5000/api/device/verify/initiate \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"abc123","deviceName":"MyPhone","platform":"ios"}'
```

---

## Git Info
- **Commit:** Add comprehensive console logging for authentication flows
- **Files Modified:**
  - `backend/routes/auth.js` (LOGIN, REGISTER, QR VERIFY, OTP VERIFY)
  - `backend/routes/device.js` (DEVICE INITIATE, DEVICE STATUS CHECK)

