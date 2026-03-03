const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Find the monorepo root
const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// Include the monorepo root for watching, preserving Expo's defaults
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Ensure Metro can resolve modules from both the project and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
