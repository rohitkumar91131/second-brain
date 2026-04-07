# Browser Sign-In Feature - Quick Start

## 🚀 What Was Added

A **GitHub-like browser sign-in flow** for your mobile app:

1. User taps **"Sign In with Browser"** button
2. Browser opens → Device verification page
3. User **approves** from web
4. Mobile app **auto-signs in** ✓

## 📝 Quick Summary

| Component | File | Purpose |
|-----------|------|---------|
| **Model** | `lib/models/DeviceVerification.js` | Stores verification requests |
| **API - Initiate** | `app/api/device/verify/initiate/route.js` | Creates verification request |
| **API - Check Status** | `app/api/device/verify/[requestId]/route.js` | Polls approval status |
| **API - Approve** | `app/api/device/verify/[requestId]/approve/route.js` | User approves device |
| **Web UI** | `app/dashboard/device/adddevice/page.jsx` | Beautiful approval page |
| **Mobile Screen** | `mobile/src/screens/auth/BrowserSignInScreen.js` | Sign-in instructions |
| **Auth Context** | `mobile/src/context/AuthContext.js` | New `loginWithBrowser()` method |
| **Updated Connect** | `mobile/src/screens/auth/ConnectScreen.js` | Added browser option |

## 🔧 Install Dependencies

```bash
# Web
npm install uuid

# Mobile
cd mobile
npm install uuid expo-web-browser expo-device
```

## 📱 How to Test

### Step 1: Start Web Server
```bash
npm run dev
# Running on http://localhost:3000
```

### Step 2: Start Mobile App
```bash
cd mobile
expo start
# Scan QR with Expo Go
```

### Step 3: Test Sign-In Flow
1. **On mobile**: Go to login screen
2. **Tap**: "Connect with QR Code"
3. **Tap**: "Sign In with Browser" (new button)
4. **Browser opens** automatically
5. **On web**: 
   - If logged in → "Approve Device" button
   - If not logged in → "Sign In First" button
6. **Approve** → Mobile app auto-signs in! ✓

## 🔒 How It Works

### Timeline
- **00:00** - User taps browser signin
- **00:02** - Browser opens with unique request URL
- **00:05** - User clicks "Approve"
- **00:01-01:00** - Mobile polls every 1 second
- **01:02** - Mobile detects approval
- **01:03** - Gets access token
- **01:04** - User signed in! ✓

### Security
- ✅ 5-minute expiration
- ✅ Auto-cleanup with TTL index
- ✅ Requires user login
- ✅ Tracks IP & device info
- ✅ Status prevents reuse

## 📲 Code Usage

### In Mobile App
```javascript
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { loginWithBrowser } = useAuth()

  const handleBrowserSignIn = async () => {
    try {
      await loginWithBrowser(
        'My Phone',        // device name
        'android',         // or 'ios'
        deviceId,          // unique device ID
        fcmToken           // optional: FCM push token
      )
      // Auto-navigates on success!
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  return (
    <TouchableOpacity onPress={handleBrowserSignIn}>
      <Text>Sign In with Browser</Text>
    </TouchableOpacity>
  )
}
```

## 🌐 API Endpoints

### 1. Create Verification Request
```bash
POST /api/device/verify/initiate
{
  "deviceName": "My iPhone",
  "platform": "ios",
  "deviceId": "uuid-here",
  "fcmToken": "optional-push-token"
}

Response:
{
  "requestId": "uuid",
  "verificationUrl": "http://localhost:3000/dashboard/device/adddevice?requestId=...",
  "expiresIn": 300
}
```

### 2. Check Status (Polling)
```bash
GET /api/device/verify/[requestId]

Response:
{
  "status": "pending" | "approved" | "expired" | "rejected"
}
```

### 3. Approve Device (From Web)
```bash
POST /api/device/verify/[requestId]/approve
(requires NextAuth session)

Response:
{
  "accessToken": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

## 🐛 Troubleshooting

**Q: Browser not opening?**
- Check: `expo-web-browser` installed
- Check: Device has default browser set

**Q: Mobile not getting approval?**
- Check: Running on same server (localhost:3000)
- Check: API calls not blocked
- Check: Check browser console for errors

**Q: Expired before approval?**
- Timeout is 5 minutes
- Make sure approving within window

**Q: User needs to login first?**
- That's expected! Web redirects to login
- After login, come back to approval page

## 📊 Database Schema

### DeviceVerification Collection
```javascript
{
  _id: ObjectId,
  requestId: "uuid",                    // Unique verification token
  userId: ObjectId | null,              // Set when approved
  status: "pending|approved|rejected|expired",
  deviceName: "My iPhone",
  platform: "ios|android|unknown",
  deviceId: "unique-device-identifier",
  fcmToken: "push-notification-token",
  expiresAt: Date,                      // 5 minutes from creation (auto-delete)
  approvedAt: Date | null,              // Set when user approves
  approverIp: "192.168.1.1",
  approverUserAgent: "Chrome/...",
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Customization

### Change Expiration Time
Edit `app/api/device/verify/initiate/route.js`:
```javascript
const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
```

### Change Poll Interval
Edit `mobile/src/context/AuthContext.js`:
```javascript
const pollInterval = 2000 // Poll every 2 seconds instead of 1
```

### Customize Approval Page
Edit `app/dashboard/device/adddevice/page.jsx` - it's a full Next.js page!

## 📚 Full Documentation

See `BROWSER_SIGNIN_IMPLEMENTATION.md` for complete details including:
- Detailed architecture diagram
- Security considerations
- Enhancement ideas
- Error handling strategies

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Web server running
- [ ] Mobile app running
- [ ] Tested browser sign-in flow
- [ ] Verified auto-sign-in works
- [ ] Tested expired requests
- [ ] Verified device record created

## 🎯 Next Steps

1. **Test the flow** (instructions above)
2. **Customize UI** as needed
3. **Add rate limiting** for production
4. **Enable push notifications** (optional)
5. **Add device management UI**

Enjoy! 🎉
