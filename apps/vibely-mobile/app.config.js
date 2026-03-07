/* eslint-disable no-undef */
// ============================================================
// apps/mobile/app.config.js
// ============================================================
// WHY app.config.js instead of app.json?
// app.config.js is a JavaScript file — it can read environment
// variables at build time. This lets us have one config file
// that produces different bundles for dev, preview, and production
// based on EAS_BUILD_PROFILE or NODE_ENV.
// ============================================================

const IS_PROD = process.env.EAS_BUILD_PROFILE === "production";
const IS_PREVIEW = process.env.EAS_BUILD_PROFILE === "preview";
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

module.exports = {
  expo: {
    name: IS_PROD ? "Vibely" : IS_PREVIEW ? "Vibely (Preview)" : "Vibely (Dev)",
    slug: "vibely",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#7c3aed", // Vibely purple
    },

    updates: {
      fallbackToCacheTimeout: 0,
      ...(EAS_PROJECT_ID
        ? { url: `https://u.expo.dev/${EAS_PROJECT_ID}` }
        : {}),
    },

    runtimeVersion: {
      policy: "appVersion",
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: false,
      bundleIdentifier: IS_PROD ? "com.vibely.app" : "com.vibely.app.dev",
      buildNumber: "1",
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Vibely needs access to your photos to upload them to events.",
        NSPhotoLibraryAddUsageDescription:
          "Vibely needs permission to save photos to your library.",
        NSCameraUsageDescription:
          "Vibely needs camera access to take photos for events.",
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundColor: "#7c3aed",
      },
      package: IS_PROD ? "com.vibely.app" : "com.vibely.app.dev",
      versionCode: 1,
    },

    web: {
      favicon: "./assets/favicon.png",
    },

    plugins: [
      [
        "expo-media-library",
        {
          photosPermission: "Allow Vibely to save photos to your library.",
          savePhotosPermission: "Allow Vibely to save photos.",
          isAccessMediaLocationEnabled: true,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Vibely to access your photos for uploading.",
        },
      ],
    ],

    extra: {
      ...(EAS_PROJECT_ID
        ? {
            eas: {
              projectId: EAS_PROJECT_ID,
            },
          }
        : {}),
    },
  },
};
