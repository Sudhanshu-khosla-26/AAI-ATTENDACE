# AAI Attendance App - Project Structure

## Overview

This document provides a comprehensive overview of the AAI Attendance App project structure and organization.

## Directory Structure

```
aai-attendance-app/
├── app/                          # Expo Router file-based routing
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.js            # Tab navigator configuration
│   │   ├── index.js              # Home/Dashboard screen
│   │   ├── history.js            # Attendance history with calendar
│   │   ├── leaves.js             # Leave management screen
│   │   └── profile.js            # User profile and settings
│   ├── _layout.js                # Root layout with all providers
│   ├── index.js                  # Splash screen (entry point)
│   ├── onboarding.js             # Onboarding slides (4 screens)
│   ├── login.js                  # Login screen
│   ├── register.js               # Employee registration
│   ├── forgot-password.js        # Password reset flow
│   ├── verify-otp.js             # Email OTP verification
│   ├── photo-verification.js     # Face capture for verification
│   ├── device-registration.js    # Device binding screen
│   ├── mark-attendance.js        # Check-in/check-out flow
│   ├── apply-leave.js            # Leave application form
│   └── location-management.js    # Admin location management
│
├── components/                   # Reusable UI components
│   ├── Button.js                 # Custom button with variants
│   ├── Input.js                  # Text input with validation
│   ├── Card.js                   # Card container component
│   ├── Header.js                 # App header with navigation
│   ├── Loading.js                # Loading spinner/overlay
│   ├── Skeleton.js               # Skeleton loading effect
│   ├── Toast.js                  # Toast notifications
│   ├── OfflineBanner.js          # Offline status banner
│   ├── EmptyState.js             # Empty state display
│   ├── ErrorBoundary.js          # Error catching component
│   ├── AAILogo.js                # AAI branding logo
│   ├── AttendanceStatusCard.js   # Dashboard attendance card
│   ├── StatsCard.js              # Statistics display card
│   ├── LeaveBalanceCard.js       # Leave balance display
│   ├── Calendar.js               # Monthly calendar view
│   ├── GeofenceMap.js            # Map with geofence display
│   ├── CameraView.js             # Camera for face capture
│   └── SuccessAnimation.js       # Success checkmark animation
│
├── context/                      # React Context providers
│   ├── AuthContext.js            # Authentication state
│   ├── AttendanceContext.js      # Attendance state
│   ├── LeaveContext.js           # Leave management state
│   └── AppContext.js             # App-wide state (offline, sync)
│
├── services/                     # Business logic layer
│   ├── authService.js            # Authentication operations
│   ├── attendanceService.js      # Attendance operations
│   ├── leaveService.js           # Leave management operations
│   └── locationService.js        # Location/geofence operations
│
├── utils/                        # Utility functions
│   ├── dateUtils.js              # Date/time formatting
│   ├── locationUtils.js          # GPS/geofence calculations
│   ├── validationUtils.js        # Form validation
│   └── storageUtils.js           # AsyncStorage wrapper
│
├── constants/                    # App constants
│   ├── colors.js                 # AAI brand colors
│   └── config.js                 # App configuration
│
├── assets/                       # Static assets
│   └── images/                   # Images and icons
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler config
├── jsconfig.json                 # JavaScript/IDE config
├── .gitignore                    # Git ignore rules
└── README.md                     # Project documentation
```

## Key Components

### Screens (app/)

| Screen | Purpose |
|--------|---------|
| Splash | App launch with AAI branding |
| Onboarding | 4-slide feature introduction |
| Login | Employee authentication |
| Register | New employee registration |
| Forgot Password | Password reset with OTP |
| Verify OTP | Email verification |
| Photo Verification | Face capture for attendance |
| Device Registration | Device binding with biometric |
| Home (Tabs) | Dashboard with attendance status |
| History | Monthly attendance calendar |
| Leaves | Leave management and application |
| Profile | User profile and settings |
| Mark Attendance | Check-in/check-out flow |
| Apply Leave | Leave application form |
| Location Management | Admin location/geofence management |

### Services

| Service | Responsibility |
|---------|---------------|
| authService | Login, register, OTP, password reset, device registration |
| attendanceService | Check-in/out, history, stats, sync |
| leaveService | Apply, cancel, balances, history |
| locationService | CRUD operations for workplace locations |

### Contexts

| Context | State Managed |
|---------|--------------|
| AuthContext | User session, authentication status |
| AttendanceContext | Today's attendance, history, stats |
| LeaveContext | Leave balances, applications |
| AppContext | Online/offline status, sync queue, settings |

## Data Flow

```
UI Components -> Context -> Services -> AsyncStorage
                    |
                    v
              Local State
```

## Storage Schema (AsyncStorage)

| Key | Data Type | Description |
|-----|-----------|-------------|
| @user_session | Object | Current user session |
| @user_profile_photo | Object | User's verification photo |
| @device_registration | Object | Registered device info |
| @attendance_records | Array | All attendance records |
| @leave_balances | Object | Leave balances by employee |
| @leave_applications | Array | All leave applications |
| @sync_queue | Array | Pending sync operations |
| @app_settings | Object | User preferences |
| @onboarding_completed | Boolean | Onboarding status |
| @registered_users | Array | All registered users |
| @locations | Array | Workplace locations |
| @last_sync | String | Last sync timestamp |

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Navy) | #0a2463 | Headers, buttons, branding |
| Saffron | #FF9933 | Accents, Indian flag theme |
| Green | #138808 | Success, Indian flag theme |
| Success | #10B981 | Positive actions, present status |
| Error | #EF4444 | Errors, absent status |
| Warning | #F59E0B | Warnings, half-day status |
| Info | #3B82F6 | Information, leave status |

## Navigation Structure

```
Stack Navigator (Root)
├── Splash
├── Onboarding
├── Login
├── Register
├── Forgot Password
├── Verify OTP
├── Photo Verification
├── Device Registration
└── Tab Navigator
    ├── Home (Dashboard)
    ├── History
    ├── Leaves
    └── Profile

Modals:
├── Mark Attendance
├── Apply Leave
└── Location Management
```

## Package Versions

All packages are compatible with Expo SDK 50:

- expo: ~50.0.0
- expo-router: ~3.4.0
- react-native: 0.73.2
- react-native-paper: ^5.12.0
- react-native-maps: 1.8.0
- expo-camera: ~14.0.0
- expo-location: ~16.5.0
- expo-local-authentication: ~13.8.0

## Development Guidelines

1. **Components**: Keep components small and focused
2. **Services**: All business logic goes in services
3. **Context**: Use contexts for shared state
4. **Storage**: Always use storageUtils for AsyncStorage
5. **Validation**: Use validationUtils for form validation
6. **Dates**: Use dateUtils for all date operations
7. **Locations**: Use locationUtils for GPS calculations

## Testing

```bash
# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run in web browser
npx expo start --web
```

## Building

```bash
# Android APK
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease

# iOS
npx expo prebuild --platform ios
cd ios && xcodebuild -workspace AAIAttendance.xcworkspace -scheme AAIAttendance -configuration Release
```
