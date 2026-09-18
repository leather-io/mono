import {
  clearBiometricAutoPromptSuppression,
  isBiometricAutoPromptSuppressed,
  shouldSuppressBiometricAutoPrompt,
  suppressBiometricAutoPrompt,
} from './biometric-auto-prompt';

describe('biometric automatic prompt suppression', () => {
  beforeEach(async () => {
    await chrome.storage.session.clear();
  });

  test('is absent by default and can be set and cleared for the extension session', async () => {
    await expect(isBiometricAutoPromptSuppressed()).resolves.toBe(false);

    await suppressBiometricAutoPrompt();

    await expect(isBiometricAutoPromptSuppressed()).resolves.toBe(true);

    await clearBiometricAutoPromptSuppression();

    await expect(isBiometricAutoPromptSuppressed()).resolves.toBe(false);
  });

  test('suppresses only allowlisted unambiguous operational failures', () => {
    expect(shouldSuppressBiometricAutoPrompt('credential-mismatch')).toBe(true);
    expect(shouldSuppressBiometricAutoPrompt('prf-unavailable')).toBe(true);
    expect(shouldSuppressBiometricAutoPrompt('unavailable')).toBe(false);
    expect(shouldSuppressBiometricAutoPrompt('cancelled-or-timeout')).toBe(false);
    expect(shouldSuppressBiometricAutoPrompt('NotAllowedError')).toBe(false);
  });
});
