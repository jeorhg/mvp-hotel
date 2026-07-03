module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Removed 'nativewind/babel' temporarily to avoid Babel plugin shape errors
    // Re-add after resolving plugin compatibility if needed.
  };
};
