const { withEntitlementsPlist, withAndroidManifest } = require('expo/config-plugins');

// A free Apple ID ("Personal Team") can't sign apps that use push notifications.
// Set FREE_APPLE_ID=1 when building straight to a phone from Xcode without a paid
// Apple Developer account; everything except push keeps working.
const withoutPushEntitlement = (config) =>
  withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });

// The app is portrait-only, which makes Android treat a portrait screen as a
// *required* feature and hides the app on Google Play from some tablets,
// Chromebooks and XR devices. Declaring it optional keeps them eligible; the
// app still always shows in portrait.
const withOptionalPortraitScreen = (config) =>
  withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest['uses-feature'] = (manifest['uses-feature'] || []).filter(
      (f) => f.$['android:name'] !== 'android.hardware.screen.portrait'
    );
    manifest['uses-feature'].push({ $: { 'android:name': 'android.hardware.screen.portrait', 'android:required': 'false' } });
    return mod;
  });

module.exports = ({ config }) => {
  config.plugins = [...(config.plugins || []), withOptionalPortraitScreen];
  if (process.env.FREE_APPLE_ID) {
    // Mods run last-registered-first, so this goes at the front to run after expo-notifications.
    config.plugins = [withoutPushEntitlement, ...(config.plugins || [])];
  }
  return config;
};
