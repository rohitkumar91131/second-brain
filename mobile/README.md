# Second Brain — Mobile App (React Native / Expo)

A full-featured React Native mobile companion for the [Second Brain](https://github.com/rohitkumar91131/second-brain) web app.  
Uses the same Next.js backend — no separate server needed.

---

## ✨ Features

| Feature | Status |
|---|---|
| Email / Password login | ✅ |
| QR Code pairing with web dashboard | ✅ |
| Dashboard overview (tasks, projects, goals, notes summary) | ✅ |
| Tasks — list, create, edit, complete, delete | ✅ |
| Projects — list, create, edit, delete | ✅ |
| Goals — list, create, edit, progress tracking | ✅ |
| Notes — list, create, view blocks (read-only rich content) | ✅ |
| Journal — list, create, mood tracking | ✅ |
| Resources — list, create | ✅ |
| Media Bank — grid view of all images/videos/audio | ✅ |
| Settings — profile edit, sign out | ✅ |
| Dark theme matching the web app | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- A deployed (or locally running) Second Brain web app

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure the API URL

Edit `src/constants/config.js`:

```js
// For local dev (Android emulator uses 10.0.2.2, iOS simulator uses localhost)
export const API_BASE_URL = 'http://10.0.2.2:3000'   // Android emulator
// export const API_BASE_URL = 'http://localhost:3000'  // iOS simulator
// export const API_BASE_URL = 'https://your-app.vercel.app' // Production
```

> **Note:** When using QR code pairing, the server URL is automatically read from the QR code — no manual config needed.

### 3. Start the development server

```bash
npm start
```

Scan the QR code in the Expo Go app (iOS/Android) to run on your phone.

---

## 📱 Connecting to the Web App via QR Code

1. Open your Second Brain web app in a browser.
2. Go to **Dashboard → Connect** (sidebar).
3. A QR code will appear — it expires in 5 minutes. Click **Refresh** to regenerate.
4. Open the mobile app → on the login screen tap **Connect with QR Code**.
5. Point your camera at the QR code.
6. You'll be instantly logged in with a 30-day JWT token stored securely on device.

---

## 📦 Building an APK (Android)

### Using Expo EAS Build (recommended)

```bash
npm install -g eas-cli
eas login
eas build:configure      # first time setup
eas build --platform android --profile preview
```

This produces an `.apk` file you can install directly on Android devices.

### Local build (requires Android Studio + JDK)

```bash
npx expo run:android
```

---

## 🔑 Authentication Methods

| Method | How it works |
|---|---|
| Email + Password | Calls `/api/auth/login`, receives JWT |
| QR Code | Scans `secondbrain://connect?token=…&server=…`, calls `/api/device/verify`, receives JWT |

The JWT is stored in `expo-secure-store` (encrypted keystore on device).  
All API calls include `Authorization: Bearer <token>` header.

---

## 🌐 API Routes Used

The mobile app calls the following Next.js API routes:

| Route | Purpose |
|---|---|
| `POST /api/auth/login` | Email/password login |
| `POST /api/auth/register` | Register new account |
| `POST /api/device/verify` | Verify QR pairing token → get JWT |
| `GET /api/tasks` | List tasks |
| `POST /api/tasks` | Create task |
| `PATCH /api/tasks/:id` | Update task |
| `DELETE /api/tasks/:id` | Delete task |
| `GET /api/projects` | List projects |
| `POST /api/projects` | Create project |
| `PATCH /api/projects/:id` | Update project |
| `DELETE /api/projects/:id` | Delete project |
| `GET /api/goals` | List goals |
| `POST /api/goals` | Create goal |
| `PATCH /api/goals/:id` | Update goal |
| `DELETE /api/goals/:id` | Delete goal |
| `GET /api/notes` | List notes |
| `POST /api/notes` | Create note |
| `GET /api/notes/:id/blocks` | Get note blocks |
| `GET /api/journal` | List journal entries |
| `POST /api/journal` | Create journal entry |
| `GET /api/journal/:id/blocks` | Get journal blocks |
| `GET /api/resources` | List resources |
| `POST /api/resources` | Create resource |
| `GET /api/blocks/media` | Get all media blocks |
| `GET /api/user/profile` | Get user profile |
| `PATCH /api/user/profile` | Update profile |

---

## 📁 Project Structure

```
mobile/
├── App.js                        # Root component
├── app.json                      # Expo configuration
├── babel.config.js
├── package.json
└── src/
    ├── navigation/
    │   ├── AppNavigator.js       # Root navigator (auth check)
    │   ├── AuthNavigator.js      # Login / Register / Connect screens
    │   └── DashboardNavigator.js # Bottom tab + stack navigators
    ├── screens/
    │   ├── HomeScreen.js         # Dashboard overview
    │   ├── MediaScreen.js
    │   ├── ResourcesScreen.js
    │   ├── SettingsScreen.js
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   └── ConnectScreen.js  # QR scanner
    │   ├── tasks/
    │   │   ├── TasksScreen.js
    │   │   └── TaskDetailScreen.js
    │   ├── projects/
    │   │   ├── ProjectsScreen.js
    │   │   └── ProjectDetailScreen.js
    │   ├── goals/
    │   │   ├── GoalsScreen.js
    │   │   └── GoalDetailScreen.js
    │   ├── notes/
    │   │   ├── NotesScreen.js
    │   │   └── NoteDetailScreen.js
    │   └── journal/
    │       ├── JournalScreen.js
    │       └── JournalDetailScreen.js
    ├── services/
    │   └── api.js                # Axios API client
    ├── context/
    │   └── AuthContext.js        # Auth state + JWT persistence
    └── constants/
        ├── config.js             # API base URL
        └── theme.js              # Colors, spacing, typography
```

---

## ⚙️ Environment

No `.env` file is needed in the mobile app — the API URL is set in `src/constants/config.js`.  
Secrets are stored on-device using `expo-secure-store`.

---

## 🔧 Troubleshooting

**Network request failed on Android emulator:**  
Use `10.0.2.2` instead of `localhost` in `config.js`.

**QR code not scanning:**  
Make sure camera permissions are granted. On Android, check Settings → Apps → Second Brain → Permissions.

**JWT expired (401 errors after 30 days):**  
Log out and sign in again (or use QR code to re-pair).
