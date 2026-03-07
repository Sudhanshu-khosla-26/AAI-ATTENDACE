# iOS Build Troubleshooting & Fix Guide

To fix the failed iOS build on EAS, follow these steps. The primary issues are related to mandatory App Store compliance keys and interactive credential setup.

## 1. Compliance Configuration (Fixed)
The build failed because `ITSAppUsesNonExemptEncryption` was missing. 
**Status:** I have already updated your `app.json` with:
```json
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```
*Note: Set this to `true` only if your app uses custom encryption beyond standard HTTPS.*

## 2. Fix Credential Setup (Action Required)
The error `Credentials are not set up. Run this command again in interactive mode` means EAS cannot automatically create your Apple Distribution Certificate because it needs you to log in to your Apple Developer account.

### Solution:
**NOTE:** `eas` is an npm package, not a system package (don't use `apt install`). Use `npx` to run it without installing globally.

Run this command in your terminal **locally**:

```bash
npx eas-cli build --platform ios
```

If you are prompted, follow these steps:
1. **Log in to Apple**: Enter your Apple ID and Password (and 2FA code).
2. **Select Team**: If you have multiple teams, pick the correct one.
3. **Provisioning**: When asked "How would you like to set up your iOS build credentials?", choose **"Automatically"**.

## 3. Handle the "Expo Go" Warning
EAS detected you are using Expo Go for a production build. For a production-ready AAI app, you should create a **Development Build**.

To suppress the warning in your build environment, you can run:
```bash
EAS_BUILD_NO_EXPO_GO_WARNING=true npx eas-cli build --platform ios
```

## 4. Summary Checklist for iOS Build
- [x] `bundleIdentifier` is unique (`com.aai.attendance`).
- [x] `ITSAppUsesNonExemptEncryption` is set to `false`.
- [ ] Apple Developer Program membership is active ($99/year).
- [ ] Run `npx eas-cli build` in **interactive mode** at least once to sync certificates.

---
**Next Step:** Open your terminal in the `AAI-ATTENDACE` folder and run `npx eas-cli build --platform ios`.
