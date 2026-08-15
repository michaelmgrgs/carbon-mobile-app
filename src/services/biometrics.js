import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'carbon_biometric_enabled';

/** Whether this device even has Face ID / Touch ID / fingerprint hardware set up. */
export async function isBiometricAvailable() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

/** Human-readable label for the settings toggle — "Face ID" vs "Touch ID" vs generic. */
export async function getBiometricLabel() {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Touch ID';
  return 'Biometric login';
}

export async function isBiometricEnabled() {
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value === 'true';
}

export async function setBiometricEnabled(enabled) {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

/** Prompts Face ID / Touch ID. Returns true only on real success. */
export async function promptBiometricAuth(reason = 'Unlock Carbon') {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Use password instead',
      disableDeviceFallback: false, // allows falling back to device passcode, standard practice
    });
    return result.success === true;
  } catch (err) {
    console.warn('Biometric auth error:', err.message);
    return false;
  }
}
