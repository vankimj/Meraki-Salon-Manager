# Meraki Mobile — Setup

Expo React Native app for staff (schedule + clients).

## Quick start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your phone instantly during development.

## Before building for production

### 1. Google Sign-In — set the web client ID
In `src/screens/AuthScreen.jsx`, replace the `webClientId` placeholder with the actual value from:
Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Web client

### 2. Firebase Google Services files
For a production/EAS build you need:
- iOS: `GoogleService-Info.plist` → place in `mobile/`
- Android: `google-services.json` → place in `mobile/`

Download both from Firebase Console → Project Settings → Your apps.

### 3. EAS Build (production)
```bash
npm install -g eas-cli
eas login
eas build --platform all
```

## File map

```
mobile/
  App.jsx                     — entry: auth check → AuthScreen or RootNav
  src/
    lib/
      firebase.js             — Firebase config (same project as web)
      firestore.js            — Firestore helpers (appointments, clients, etc.)
    navigation/
      RootNav.jsx             — React Navigation stack
    screens/
      AuthScreen.jsx          — Google sign-in
      HomeScreen.jsx          — Tile grid (Schedule, Clients, Services)
      ScheduleScreen.jsx      — Day view with date nav
      ClientsScreen.jsx       — Searchable client list
```
