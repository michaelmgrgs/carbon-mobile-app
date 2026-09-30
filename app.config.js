const { withEntitlementsPlist } = require('expo/config-plugins');

// A free Apple ID ("Personal Team") can't sign apps that use push notifications.
// Set FREE_APPLE_ID=1 when building straight to a phone from Xcode without a paid
// Apple Developer account; everything except push keeps working.
const withoutPushEntitlement = (config) =>
  withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });

module.exports = ({ config }) => {
  if (process.env.FREE_APPLE_ID) {
    // Mods run last-registered-first, so this goes at the front to run after expo-notifications.
    config.plugins = [withoutPushEntitlement, ...(config.plugins || [])];
  }
  return config;
};
