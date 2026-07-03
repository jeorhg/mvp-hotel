const { getDefaultConfig } = require('expo/metro-config');

// Temporarily disable NativeWind's metro transformer to isolate bundling issues.
// If this fixes the timeout, re-enable NativeWind after further investigation.
console.log('[metro.config] using default Metro config (nativewind disabled)');
module.exports = getDefaultConfig(__dirname);
