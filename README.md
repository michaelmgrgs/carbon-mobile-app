# Carbon — Member App

React Native (Expo) app for Carbon gym members: login, browse & buy
packages, track attendance, QR check-in at the front desk, news, and push
notifications. One codebase builds both iOS and Android.

## 1. Install

```bash
npm install
```

## 2. Point it at your backend

Edit `app.json` → `expo.extra.apiBaseUrl` to your deployed backend's mobile
API, e.g. `https://api.carbongym.com/api/mobile`. (See `backend-additions/`
for what to deploy — it plugs into your existing `carbon-app` server.)

## 3. Run it

```bash
npx expo start
```
Scan the QR with **Expo Go** (iOS/Android) for instant preview, or press
`i` / `a` to launch a simulator/emulator.

## 4. Build real app-store binaries

This uses [EAS Build](https://docs.expo.dev/build/introduction/) (free tier
available), no Mac required even for iOS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # produces a .aab for Play Store
eas build --platform ios       # produces an .ipa for App Store (needs your Apple Developer account, $99/yr)
```

Then submit with `eas submit`, or upload manually via App Store Connect /
Play Console.

## What's implemented

- **Auth**: JWT login/register, secure token storage (`expo-secure-store`), auto-refresh
- **Packages**: browse by branch, package detail, "Request this package" (staff confirms & activates — no online payment in v1)
- **My subscriptions**: active packages + full history, sessions remaining
- **Attendance**: camera QR scanner (`expo-camera`) that reads the rotating front-desk code and checks in; check-in history
- **News**: feed pulled from `/api/mobile/news`
- **Push notifications**: Expo push token registration + receiving (`expo-notifications`)
- **Profile**: view/edit info, change password, logout

## Design

Colors and type pulled from `carbon-logo.png`: near-black `#141514`
background, white text, red `#D6362F` accent — see `src/theme/theme.js`.

## Known gaps to close before shipping

- Add your Apple Developer / Google Play accounts for store submission
- Swap the placeholder `apiBaseUrl` for your production domain (HTTPS required by both app stores)
- Give staff a way to see/approve pending package requests (currently API-only — see backend README)
- V2: wire in real online payment (Paymob integration is pre-built and waiting in `backend-additions/v2-future/paymob.js`)
- Consider adding class booking / coach schedules to the app — your database already has `classes_schedule`, `coaches`, and `coach_classes` tables ready for this
