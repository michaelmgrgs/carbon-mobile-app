# Carbon — store listing text

Copy each field into App Store Connect / Google Play Console. Character limits are in brackets.

---

## Apple App Store

**App name** [30]
Carbon Gym

**Subtitle** [30]
Book classes. Check in. Train.

**Category**
Primary: Health & Fitness · Secondary: Lifestyle

**Promotional text** [170] — can be changed any time without review
Your Carbon membership in your pocket: book classes, scan in at the front desk, and track every session you train.

**Description** [4000]
```
Carbon Gym's official member app. Everything about your membership, in one place.

CHECK IN IN SECONDS
Scan the QR code at the front desk and you're in. Your remaining sessions update instantly.

BOOK YOUR CLASSES
Browse the weekly class schedule across Carbon branches, reserve your spot, and manage your bookings.

YOUR PACKAGES
Explore all Carbon packages, request the one that fits you, and keep track of your active subscriptions, sessions left and expiry dates.

TRACK YOUR PROGRESS
See your full attendance history and subscription history at a glance.

STAY IN THE LOOP
Get gym news, announcements and reminders straight to your phone.

FAST, SECURE LOGIN
Unlock the app with Face ID or Touch ID. Manage your profile, change your password, or delete your account any time.

The Carbon app is for Carbon Gym members and coaches.
```

**Keywords** [100] — comma separated, no spaces
```
gym,fitness,workout,classes,booking,membership,check-in,training,crossfit,egypt,cairo,sessions
```

**Support URL**
https://carbon-app-i2s42.ondigitalocean.app/support

**Privacy Policy URL**
https://carbon-app-i2s42.ondigitalocean.app/privacy

**Copyright**
2026 Carbon Gym

**What's New in This Version** [4000] — version 1.0.0
```
Welcome to the Carbon app! Book classes, check in with a QR scan, and track your membership.
```

### Age rating questionnaire
Answer **None / No** to every content question (violence, mature themes, gambling, etc.).
- Unrestricted web access: **No**
- User-generated content / messaging between users: **No**
→ Result: **4+**

### App Privacy ("nutrition label")
Tracking: **No, we do not track** (no ads, no third-party analytics).

Data collected — all **Linked to the user**, purpose **App Functionality**, **not** used for tracking:

| Apple category | Data type | Why |
|---|---|---|
| Contact Info | Name | Account |
| Contact Info | Email Address | Login, password reset emails |
| Contact Info | Phone Number | Account |
| Contact Info | Other User Contact Info | Residential area (optional) |
| Identifiers | User ID | Account |
| Identifiers | Device ID | Push notification token |
| Usage Data | Product Interaction | Check-ins, class bookings |
| Purchases | Purchase History | Packages / subscriptions |
| Other Data | Other Data Types | Date of birth, gender (optional) |

Not collected: location, contacts, photos/videos, health, financial info, browsing history, diagnostics.
Camera is used only to scan QR codes (nothing stored). Face ID data never leaves the device — don't declare it.

### Export compliance
Already answered in the app (`ITSAppUsesNonExemptEncryption: false`, standard HTTPS only).

### App Review information
- **Sign-in required:** Yes
- **Demo account:** username and password of the demo member (create it first — see below)
- **Attachment:** a short screen recording of a QR check-in at the front desk (record it on your iPhone)
- **Notes** (paste and adjust):
```
Carbon is the member app for Carbon Gym, a gym in Egypt. Members log in to view packages, book classes, and check in.

Demo account: an active member with a package and sessions left.

QR check-in: members scan a QR code shown on a tablet at the gym's front desk. For security the code changes every few seconds, so it can only be used at the gym. A short screen recording of a real check-in is attached. All other features work with the demo account.

Account deletion: Profile → Delete account.
```

### Demo account for reviewers (create before submitting)
- A normal member (`user` role) on the live server, e.g. `appreview@…`
- Give it an active package with sessions left, and one class booking, so every screen has content.
- **Don't delete it from the app** during your own testing.

---

## Google Play

**App name** [30]
Carbon Gym

**Short description** [80]
Book classes, check in with a QR scan, and manage your Carbon Gym membership.

**Full description** [4000]
Same as the Apple description above.

**Category**
Health & Fitness

**Contact details**
Email: your support email · Website: https://carbon-app-i2s42.ondigitalocean.app/support

**Privacy policy**
https://carbon-app-i2s42.ondigitalocean.app/privacy

### Data safety form
- Does your app collect or share user data? **Yes, collects** · **No sharing** (service providers that process data for you don't count as sharing)
- Encrypted in transit: **Yes**
- Users can request deletion: **Yes** (in the app: Profile → Delete account)

| Google category | Data type | Collected | Optional? | Purpose |
|---|---|---|---|---|
| Personal info | Name | Yes | Required | Account management |
| Personal info | Email address | Yes | Required | Account management, communications |
| Personal info | Phone number | Yes | Required | Account management |
| Personal info | Address (residential area) | Yes | Optional | Account management |
| Personal info | Other info (date of birth, gender) | Yes | Optional | Account management |
| App activity | Other user-generated content / in-app actions | Yes | Required | App functionality (check-ins, bookings) |
| Financial info | Purchase history | Yes | Required | App functionality (packages) |
| Device or other IDs | Device ID (push token) | Yes | Optional | Communications (notifications) |

None of it is processed ephemerally. Not collected: location, photos, contacts, health, files, messages.

### Content rating (IARC questionnaire)
Category: **Reference, News, or Educational / Utility** → answer **No** to everything → **Everyone / 3+**

### Target audience
**18 and over**. Picking under-13 adds Families policy requirements you don't need.

### Ads
**No, my app does not contain ads.**

### App access
"All or some functionality is restricted" → add the same demo login and the same notes as for Apple.

---

## Screenshots (still to do)
- **Apple:** 6.9" iPhone (1320 × 2868) — 3 to 10 screenshots. 6.5" is optional.
- **Google:** at least 2 phone screenshots, plus a **1024 × 500 feature graphic**.
- Suggested set: Home → Packages → Class schedule → QR check-in → Attendance history → Profile.
- Easiest: take them on your iPhone from the TestFlight build. I can then frame them with captions at the right sizes.
