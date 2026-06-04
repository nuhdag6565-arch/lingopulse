// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v9+ modüler API için paket exports desteği
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
