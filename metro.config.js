const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable package exports resolving un-transpiled modern ESM packages from node_modules
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
