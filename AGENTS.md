# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

This project is intentionally pinned to SDK 54, not newer SDKs (55/56/57). The Expo Go app
installed on real test devices is what actually gates this - each Expo Go build only supports
one specific SDK (check via Expo Go's Settings tab -> "Supported SDK"), and it lags behind
whatever the newest Expo SDK release is, sometimes by a lot, depending on the device's App
Store/Play Store update history and OS version.

Before upgrading the SDK here, check what SDK the actual test device's installed Expo Go reports
as "Supported SDK" (Expo Go app -> Settings tab -> App Info), and match this project to that -
otherwise real devices will hit "Project is incompatible with this version of Expo Go" again.
