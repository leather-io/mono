type BiometricUnlockSettingsState = 'hidden' | 'off' | 'on' | 'unavailable';

interface BiometricUnlockSettingsStateArgs {
  biometrics: boolean;
  hasSoftwareKeys: boolean;
  platformAuthenticatorAvailable: boolean;
  targetBrowser: string;
  valid: boolean;
}

export function getBiometricUnlockSettingsState({
  biometrics,
  hasSoftwareKeys,
  platformAuthenticatorAvailable,
  targetBrowser,
  valid,
}: BiometricUnlockSettingsStateArgs): BiometricUnlockSettingsState {
  if (targetBrowser !== 'chromium' || !hasSoftwareKeys) return 'hidden';
  if (!valid || !platformAuthenticatorAvailable) return 'unavailable';
  return biometrics ? 'on' : 'off';
}

export function getBiometricUnlockSettingsLabel(state: BiometricUnlockSettingsState) {
  if (state === 'on') return 'On';
  if (state === 'off') return 'Off';
  return 'Unavailable';
}
