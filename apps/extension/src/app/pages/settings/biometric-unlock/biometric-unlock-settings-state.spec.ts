import { getBiometricUnlockSettingsState } from './biometric-unlock-settings-state';

describe(getBiometricUnlockSettingsState.name, () => {
  test('hides the entry without software keys and in Firefox builds', () => {
    expect(
      getBiometricUnlockSettingsState({
        biometrics: false,
        hasSoftwareKeys: false,
        platformAuthenticatorAvailable: true,
        targetBrowser: 'chromium',
        valid: true,
      })
    ).toBe('hidden');
    expect(
      getBiometricUnlockSettingsState({
        biometrics: true,
        hasSoftwareKeys: true,
        platformAuthenticatorAvailable: true,
        targetBrowser: 'firefox',
        valid: true,
      })
    ).toBe('hidden');
  });

  test('keeps the entry visible for mixed-wallet state whenever software keys exist', () => {
    expect(
      getBiometricUnlockSettingsState({
        biometrics: false,
        hasSoftwareKeys: true,
        platformAuthenticatorAvailable: true,
        targetBrowser: 'chromium',
        valid: true,
      })
    ).toBe('off');
  });

  test('distinguishes unavailable and enrolled states', () => {
    expect(
      getBiometricUnlockSettingsState({
        biometrics: false,
        hasSoftwareKeys: true,
        platformAuthenticatorAvailable: false,
        targetBrowser: 'chromium',
        valid: true,
      })
    ).toBe('unavailable');
    expect(
      getBiometricUnlockSettingsState({
        biometrics: true,
        hasSoftwareKeys: true,
        platformAuthenticatorAvailable: true,
        targetBrowser: 'chromium',
        valid: true,
      })
    ).toBe('on');
  });
});
