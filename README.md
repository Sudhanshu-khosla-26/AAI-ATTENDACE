# AAI Attendance App

A modern, secure, and user-friendly attendance platform built for Airport Authority of India (AAI) teams.

## Why this project stands out

- **Fast attendance marking** with location and photo verification
- **Security-first design** with OTP, biometric unlock, and device registration
- **Offline-ready experience** with automatic sync when connectivity returns
- **Complete leave workflow** for applying, tracking, and managing leave requests
- **Admin-ready location controls** with geofence and polygon boundary support

## Core capabilities

### Employee experience
- Secure login and account onboarding
- Mark check-in/check-out with GPS and photo verification
- View live attendance status and monthly history
- Apply for leave and monitor approval status
- Access profile and app settings in one place

### Admin experience
- Manage attendance locations
- Configure geofence and polygon boundaries
- Support employee onboarding and attendance governance

### Platform capabilities
- Offline-first architecture
- Local persistence with sync queue
- Structured service layer and context-driven state management
- React Native + Expo app architecture for rapid iteration

## Technology stack

- **Framework:** React Native with Expo SDK 54
- **Routing:** Expo Router v6
- **UI:** React Native Paper
- **State:** React Context API
- **Storage:** AsyncStorage
- **Maps:** react-native-maps
- **Camera:** expo-camera
- **Location:** expo-location
- **Biometric auth:** expo-local-authentication

## Getting started

### Prerequisites
- Node.js 18+
- npm
- Android Studio (for Android emulator) and/or Xcode (for iOS simulator)

### Installation

```bash
git clone <repository-url>
cd aai-attendance-app
npm install
```

### Run the app

```bash
npm run start
```

Then:
- Press `a` for Android
- Press `i` for iOS

## Project structure

```text
app/          # App screens and routes (Expo Router)
components/   # Reusable UI components
context/      # Global state providers
services/     # Business logic layer
utils/        # Helper and utility functions
constants/    # Centralized static configuration
assets/       # Images and static resources
```

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run test
```

## Security and configuration notes

- Keep production credentials and API keys out of source control.
- Configure environment-specific values before production builds.
- Review location/camera permission flows for your deployment policies.

## Roadmap ideas

- Backend API integration for centralized attendance records
- Push notifications for reminders and approvals
- Analytics dashboards for attendance trends
- Extended role-based access controls

## Contributing

Contributions are welcome through issues and pull requests. Please share clear context, reproduction steps, and screenshots (if UI-related).

## License

This project is proprietary software for Airport Authority of India.
