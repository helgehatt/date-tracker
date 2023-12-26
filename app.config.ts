import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Daytr",
  slug: "date-tracker",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  backgroundColor: "#2C394B",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#2C394B",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.helgehatt.datetracker",
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.helgehatt.datetracker",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#2C394B",
    },
  },
  extra: {
    eas: {
      projectId: "55012730-2e6b-4c86-b78c-aea5fb319c80",
    },
  },
});