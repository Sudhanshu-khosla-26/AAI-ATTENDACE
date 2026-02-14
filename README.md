# AAI Attendance App

A comprehensive mobile attendance system for Airport Authority of India (AAI) employees built with React Native and Expo.

## Features

### Authentication & Security
- **Secure Login**: Employee ID and password authentication
- **Biometric Authentication**: Fingerprint/Face ID support for app unlock
- **Device Registration**: One-time device binding for security
- **Photo Verification**: Face capture for attendance verification
- **OTP Verification**: Email-based OTP for password reset and first-time login

### Attendance Management
- **Geofence Attendance**: GPS-based location verification
- **Face Capture**: Photo verification during check-in/check-out
- **Offline Support**: Mark attendance without internet, sync when online
- **Real-time Status**: View today's attendance status on dashboard
- **Attendance History**: Monthly calendar view with color-coded status

### Leave Management
- **Leave Application**: Apply for Casual, Sick, and Earned Leave
- **Balance Tracking**: Real-time leave balance display
- **Application Status**: Track pending, approved, and rejected applications
- **Admin Approval**: Workflow for leave approval (admin feature)

### Admin Features
- **Location Management**: Add/edit workplace locations with geofence
- **Polygon Geofence**: Draw custom attendance boundaries on map
- **User Management**: View and manage employee registrations

### Technical Features
- **Offline-First Architecture**: Works without internet, syncs when connected
- **Google Maps Integration**: Interactive maps for location verification
- **Push Notifications**: Attendance reminders and leave updates
- **Data Sync**: Automatic sync of pending records
- **Error Handling**: Comprehensive error states and recovery

## Tech Stack

- **Framework**: React Native with Expo SDK 50
- **Navigation**: Expo Router v3
- **UI Components**: React Native Paper
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **Maps**: react-native-maps with Google Maps
- **Camera**: expo-camera for face capture
- **Location**: expo-location for GPS tracking
- **Biometrics**: expo-local-authentication

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android emulator)
- Xcode (for iOS simulator - macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aai-attendance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Maps API Key**
   
   For Android:
   - Open `app.json`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key
   
   For iOS:
   - Open `app.json`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` in the iOS config section

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
aai-attendance-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.js            # Tab layout
│   │   ├── index.js              # Home/Dashboard
│   │   ├── history.js            # Attendance history
│   │   ├── leaves.js             # Leave management
│   │   └── profile.js            # User profile
│   ├── _layout.js                # Root layout with providers
│   ├── index.js                  # Splash screen
│   ├── onboarding.js             # Onboarding slides
│   ├── login.js                  # Login screen
│   ├── register.js               # Registration screen
│   ├── forgot-password.js        # Password reset
│   ├── photo-verification.js     # Photo capture
│   ├── device-registration.js    # Device binding
│   ├── mark-attendance.js        # Check-in/check-out
│   ├── apply-leave.js            # Leave application
│   └── location-management.js    # Admin location management
├── components/                   # Reusable UI components
│   ├── Button.js
│   ├── Input.js
│   ├── Card.js
│   ├── Header.js
│   ├── Loading.js
│   ├── Skeleton.js
│   ├── Toast.js
│   ├── OfflineBanner.js
│   ├── EmptyState.js
│   ├── AAILogo.js
│   ├── AttendanceStatusCard.js
│   ├── StatsCard.js
│   ├── LeaveBalanceCard.js
│   ├── Calendar.js
│   ├── GeofenceMap.js
│   ├── CameraView.js
│   └── SuccessAnimation.js
├── context/                      # React Context providers
│   ├── AuthContext.js
│   ├── AttendanceContext.js
│   ├── LeaveContext.js
│   └── AppContext.js
├── services/                     # Business logic
│   ├── authService.js
│   ├── attendanceService.js
│   ├── leaveService.js
│   └── locationService.js
├── utils/                        # Utility functions
│   ├── dateUtils.js
│   ├── locationUtils.js
│   ├── validationUtils.js
│   └── storageUtils.js
├── constants/                    # App constants
│   ├── colors.js
│   └── config.js
├── assets/                       # Images and fonts
├── app.json                      # Expo configuration
├── package.json
└── README.md
```

## Demo Credentials

### Admin User
- **Employee ID**: AA100001
- **Password**: Admin@123
- **Role**: Admin

### Regular User
- **Employee ID**: AA100002
- **Password**: User@123
- **Role**: Employee

## Key Features Implementation

### 1. Geofence Attendance
- Uses GPS coordinates to verify user location
- Supports both circular and polygon geofences
- Visual map display with user location and workplace boundary
- Distance calculation from workplace

### 2. Face Verification
- Camera capture with face guide overlay
- Photo preview and retake option
- Local storage of verification photos
- Photo comparison during attendance marking

### 3. Offline Support
- AsyncStorage for local data persistence
- Sync queue for pending operations
- Automatic sync when connection restored
- Conflict resolution for data consistency

### 4. Biometric Authentication
- Expo Local Authentication integration
- Fingerprint and Face ID support
- Fallback to password authentication
- Configurable timeout settings

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### App Settings
Modify `constants/config.js` to customize:
- Default geofence radius
- Working hours
- Leave balances
- Sync frequency

## Building for Production

### Android
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

### iOS
```bash
npx expo prebuild --platform ios
cd ios
xcodebuild -workspace AAIAttendance.xcworkspace -scheme AAIAttendance -configuration Release
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### Common Issues

1. **Google Maps not showing**
   - Verify API key is correct
   - Enable Maps SDK for Android/iOS in Google Cloud Console
   - Check API key restrictions

2. **Camera not working**
   - Grant camera permissions in device settings
   - Ensure `expo-camera` is properly installed

3. **Location not working**
   - Enable location services on device
   - Grant location permissions
   - Check GPS signal strength

4. **Biometric authentication failing**
   - Ensure device has biometric hardware
   - Enroll fingerprints/Face ID in device settings
   - Check `expo-local-authentication` compatibility

### Debug Mode
Enable debug logging by setting:
```javascript
__DEV__ = true;
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is proprietary software developed for Airport Authority of India.

## Support

For technical support or bug reports, please contact the development team.

## Acknowledgments

- Airport Authority of India for the opportunity
- Expo team for the excellent framework
- React Native community for the ecosystem
