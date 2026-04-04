# React Native Browser-Based Device Sign-In Implementation

## Overview
Implemented a GitHub-like OAuth flow for React Native mobile apps where users can sign in using their web browser.

## How It Works

### User Flow
1. **Mobile App**: User taps "Sign In with Browser"
2. **Mobile generates**: Random UUID for the device
3. **Mobile requests**: API creates a verification request (5 minute valid window)
4. **Browser opens**: Web verification page with unique request ID
5. **Web page**: Shows device approval dialog
6. **User approves**: Clicks "Approve Device" button
7. **Mobile polls**: Checks approval status every 1 second
8. **On approval**: Gets access token automatically signed in ✓

## Components Created

### Backend (API)

#### 1. **DeviceVerification Model** (`lib/models/DeviceVerification.js`)
```javascript
- requestId: UUID (unique)
- userId: Reference to approved user
- status: pending | approved | rejected | expired
- deviceName: Device identifier
- platform: android | ios | unknown
- deviceId: Unique device identifier
- expiresAt: 5 minute expiration (auto-delete via TTL index)
- approvedAt: When user approved
- approverIp: User's IP address
- approverUserAgent: Browser info
```

#### 2. **API Endpoints**

**POST `/api/device/verify/initiate`**
- Input: `{ deviceName, platform, deviceId, fcmToken }`
- Output: `{ requestId, verificationUrl, expiresIn }`
- Creates verification request with 5-minute window

**GET `/api/device/verify/[requestId]`**
- Checks current status of verification request
- Auto-marks as expired if time exceeded
- Output: `{ status: 'pending'|'approved'|'expired'|'rejected' }`

**POST `/api/device/verify/[requestId]/approve`**
- Requires: NextAuth session
- Approves the device and links to user account
- Creates/updates Device record
- Generates and returns JWT access token
- Output: `{ accessToken, user: {...} }`

### Frontend

#### 1. **Web UI** (`app/dashboard/device/adddevice/page.jsx`)
- Beautiful device approval page
- Shows verification details and countdown timer
- Handles user login if needed
- Approve/Deny buttons
- Automatic redirect after approval

#### 2. **Mobile Screens**

**BrowserSignInScreen** (`mobile/src/screens/auth/BrowserSignInScreen.js`)
- Beautiful intro screen with instructions
- Tap to open browser button
- Shows 4-step guide
- Link to QR code signin as fallback
- Error handling

**Updated ConnectScreen** 
- Added "Sign In with Browser" button at bottom
- Seamless navigation to browser signin

#### 3. **Auth Context** (`mobile/src/context/AuthContext.js`)
New method: `loginWithBrowser(deviceName, platform, deviceId, fcmToken)`
- Initiates verification request
- Opens browser with verification URL
- Polls approval status every 1 second
- Handles timeout after 5 minutes
- Automatically persists session on approval

### Mobile API Service

**New methods in `authAPI`**:
```javascript
initiateDeviceVerification(data)
checkDeviceVerificationStatus(requestId)
approveDeviceVerification(requestId)
```

## Security Features

✅ **Short-lived tokens**: 5-minute expiration window
✅ **Device tracking**: Records IP address & user agent
✅ **User authentication**: Only logged-in users can approve
✅ **Automatic cleanup**: TTL index auto-deletes expired requests
✅ **Status tracking**: Prevents double approval or reuse
✅ **Device management**: Creates Device record for push notifications

## User Experience

### Happy Path (40 seconds)
1. Tap "Sign In with Browser" → 1 second
2. Browser opens → 2 seconds
3. Web page loads (if logged in) → 3 seconds
4. User approves → 2 seconds
5. Mobile app receives confirmation → 1 second
6. Auto sign-in happens → Instant

### With Login Required (60 seconds)
1. Tap "Sign In with Browser" → 1 second
2. Browser opens → 2 seconds
3. Redirected to login → 2 seconds
4. User logs in → 30 seconds
5. Web page shows approval dialog → 2 seconds
6. User approves → 2 seconds
7. Mobile app receives confirmation → 1 second
8. Auto sign-in happens → Instant

## Files Modified/Created

### Created
- ✅ `lib/models/DeviceVerification.js` - New model
- ✅ `app/api/device/verify/initiate/route.js` - POST endpoint
- ✅ `app/api/device/verify/[requestId]/route.js` - GET endpoint
- ✅ `app/api/device/verify/[requestId]/approve/route.js` - POST endpoint
- ✅ `app/dashboard/device/adddevice/page.jsx` - Web UI
- ✅ `mobile/src/screens/auth/BrowserSignInScreen.js` - Mobile screen

### Updated
- ✅ `mobile/src/context/AuthContext.js` - Added `loginWithBrowser`
- ✅ `mobile/src/navigation/AuthNavigator.js` - Added BrowserSignInScreen
- ✅ `mobile/src/screens/auth/ConnectScreen.js` - Added browser signin button
- ✅ `mobile/src/services/api.js` - Added new API methods
- ✅ `mobile/package.json` - Added deps: uuid, expo-web-browser, expo-device
- ✅ `package.json` - Added uuid

## Dependencies Added

### Web (Next.js)
```json
"uuid": "^9.0.1"
```

### Mobile (React Native)
```json
"uuid": "^9.0.1",
"expo-web-browser": "~13.0.0",
"expo-device": "~5.9.3"
```

## Environment Variables Needed

Make sure `NEXTAUTH_URL` is set in your `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## API Flow Diagram

```
MOBILE APP                          WEB SERVER                         USER BROWSER
    │                                   │                                    │
    ├─ Generate UUID ─────────────────────────────────────────────────────┐ │
    │                                   │                                   │ │
    ├─ POST /initiate ─────────────────>│                                   │ │
    │  (device info)                    │ Create DeviceVerification         │ │
    │                                   │ with 5-min expiry                 │ │
    │  {requestId,                      │                                   │ │
    │   verificationUrl}                │                                   │ │
    │<──────────────────────────────────│                                   │ │
    │                                   │                                   │ │
    ├─ Open Browser ──────────────────────────────────────────────────────>│
    │  with verificationUrl             │                                   │
    │                                   │                                 Load Page
    │                                   │                                   │
    │ POLLING EVERY 1 SECOND            │                                   │
    │  GET /verify/[requestId]          │                                   │
    │  ├─ status: pending ─────────────>│                                   │
    │  ├─ status: pending               │                                   │
    │  └─ (repeat)                      │                                   │
    │                                   │                                   │
    │                                   │                              User Approves
    │                                   │                                   │
    │                                   │<─── POST /approve ────────────────│
    │                                   │  (requires NextAuth session)      │
    │                                   │                                   │
    │                                   │ ✓ Create Device record            │
    │                                   │ ✓ Generate JWT                    │
    │                                   │                                   │
    │  GET /verify/[requestId]          │                                   │
    │  ├─ status: approved ─────────────>│                                   │
    │  │  userId: xxxxx                 │                                   │
    │  │<──────────────────────────────  │                                   │
    │  │                                 │                                   │
    │  ├─ POST /approve ────────────────>│ (Get token)                       │
    │  │<─ accessToken ─────────────────  │                                   │
    │                                    │                                   │
    ├─ Persist Session ──────────────────│                                   │
    ├─ Navigate to Dashboard             │                                   │
    ✓ SIGNED IN!                         │                                   │
```

## Testing Instructions

### Test Mobile Sign-In Flow

1. **Start mobile app**:
   ```bash
   cd mobile
   npm install
   expo start
   # Scan QR with Expo Go
   ```

2. **On login screen**:
   - Tap "Connect with QR Code"
   - Tap "Sign In with Browser" button
   - Browser opens to `/dashboard/device/adddevice?requestId=...`

3. **On web (if logged in)**:
   - Click "Approve Device"
   - Mobile app auto-signs in within 1-2 seconds

4. **If not logged in on web**:
   - Click "Sign In First"
   - Go through login flow
   - After login, return to approve page
   - Click "Approve Device"
   - Mobile app auto-signs in

## Next Steps (Optional Enhancements)

- [ ] Add device nickname input
- [ ] Show device history on settings page
- [ ] Send push notification on approval
- [ ] Add device management UI (trust/revoke)
- [ ] Implement device fingerprinting
- [ ] Add rate limiting on approval attempts
- [ ] Send email notification on new device approval
- [ ] Add two-factor verification option

## Error Handling

✅ Expired requests → Auto-retry or show error after 5 min
✅ Network failures → Continue polling, handle gracefully
✅ Invalid request ID → Show 404 error
✅ Unauthorized approval → Show 401 and redirect to login
✅ Browser closed → Keep polling, allow browser re-open
✅ Multiple approvals → Prevent double-approval with status checks

## Security Considerations

- [ ] Rate limit `/initiate` endpoint
- [ ] Rate limit `/approve` endpoint
- [ ] Add CAPTCHA for repeated failed attempts
- [ ] Log approval events for audit trail
- [ ] Implement IP whitelist per device
- [ ] Add device type validation
- [ ] Implement request signing with device ID
