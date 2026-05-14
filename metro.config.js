const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { mergeConfig } = require("metro-config");

const config = getDefaultConfig(__dirname);

// Exclude test files — Expo Router would otherwise treat app/**/*.test.tsx as routes.
const withoutTests = mergeConfig(config, {
  resolver: {
    blockList: [/.*\.test\.(ts|tsx)$/, /.*\.spec\.(ts|tsx)$/],
  },
});

module.exports = withNativeWind(withoutTests, { input: "./global.css" });
