const biometricAutoPromptSuppressionKey = 'biometricUnlockAutomaticPromptSuppressed';

export async function isBiometricAutoPromptSuppressed() {
  const stored = await chrome.storage.session.get(biometricAutoPromptSuppressionKey);
  return stored[biometricAutoPromptSuppressionKey] === true;
}

export async function suppressBiometricAutoPrompt() {
  await chrome.storage.session.set({ [biometricAutoPromptSuppressionKey]: true });
}

export async function clearBiometricAutoPromptSuppression() {
  await chrome.storage.session.remove(biometricAutoPromptSuppressionKey);
}

export function shouldSuppressBiometricAutoPrompt(code: string) {
  return [
    'credential-mismatch',
    'invalid-config',
    'prf-unavailable',
    'wallet-validation-failed',
  ].includes(code);
}
