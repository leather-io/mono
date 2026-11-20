const legacyHexPattern = /^[0-9a-fA-F]+$/;
const legacyMinimumKeyOriginParts = 4;

function legacyExtractFingerprintFromKeyOriginPath(keyOriginPath: string) {
  const fingerprint = keyOriginPath.split('/')[0];
  if (!legacyHexPattern.test(fingerprint))
    throw new Error('Fingerprint must be a hexadecimal string');
  return fingerprint;
}

function legacyValidateKeyOriginPath(keyOriginPath: string) {
  if (keyOriginPath.includes('[') || keyOriginPath.includes(']'))
    throw new Error('Key origin path should not contain square brackets');

  if (!keyOriginPath.includes('/'))
    throw new Error('Key origin path must contain a fingerprint and derivation path');

  legacyExtractFingerprintFromKeyOriginPath(keyOriginPath);

  if (keyOriginPath.split('/').length < legacyMinimumKeyOriginParts)
    throw new Error('Key origin path is too short. Should describe at least to the account level');
}

export function legacyCreateKeyOriginPath(fingerprint: string, path: string) {
  if (!legacyHexPattern.test(fingerprint))
    throw new Error('Fingerprint must be a hexadecimal string');
  return `${fingerprint}/${path.replace('m/', '')}`;
}

export function legacyCreateDescriptor(keyOriginPath: string, key: string) {
  legacyValidateKeyOriginPath(keyOriginPath);
  return `[${keyOriginPath}]${key}`;
}

export function legacyExtractKeyOriginPathFromDescriptor(descriptor: string) {
  const keyOriginPath = descriptor.split(']')[0].replace('[', '');
  legacyValidateKeyOriginPath(keyOriginPath);
  return keyOriginPath;
}

export function legacyExtractFingerprintFromDescriptor(descriptor: string) {
  return legacyExtractFingerprintFromKeyOriginPath(
    legacyExtractKeyOriginPathFromDescriptor(descriptor)
  );
}
