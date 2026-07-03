const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

console.log('[metro.config] using withNativeWind (forceWriteFileSystem=true)');
module.exports = withNativeWind(getDefaultConfig(__dirname), { forceWriteFileSystem: true });
