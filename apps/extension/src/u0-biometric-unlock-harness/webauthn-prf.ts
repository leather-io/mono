import { base64urlnopad } from '@scure/base';

import { type PlatformUnlockCredentialConfig } from '@shared/crypto/platform-unlock';

import {
  type PlatformAuthenticatorEvaluation,
  type PlatformAuthenticatorResult,
  type PlatformAuthenticatorTransportHint,
  createPlatformAuthenticator,
} from '@app/common/wallet-authentication/platform-authenticator';

export const rpName = 'Leather biometric unlock test';
export const userLabelPrefix = 'Leather biometric unlock test';

export type TransportHint = PlatformAuthenticatorTransportHint;
export type PrfResult<T> = PlatformAuthenticatorResult<T>;
export type PrfCredentialConfig = PlatformUnlockCredentialConfig;
export type PrfEvaluation = PlatformAuthenticatorEvaluation;

interface PrfEnrollment {
  config: PrfCredentialConfig;
  followUpRequired: boolean;
  prfOutput: Uint8Array<ArrayBuffer>;
}

function getHarnessPlatformAuthenticator(transportHint: TransportHint) {
  return createPlatformAuthenticator({ rpName, transportHint, userLabelPrefix });
}

export async function evaluatePrfCredential(
  config: PrfCredentialConfig,
  transportHint: TransportHint,
  prfInputOverride?: Uint8Array<ArrayBuffer>
): Promise<PrfResult<PrfEvaluation>> {
  const credentialConfig = prfInputOverride
    ? { ...config, prfInput: base64urlnopad.encode(prfInputOverride) }
    : config;
  return getHarnessPlatformAuthenticator(transportHint).evaluateCredential(credentialConfig);
}

export async function createPrfEnrollment(
  transportHint: TransportHint
): Promise<PrfResult<PrfEnrollment>> {
  const result = await getHarnessPlatformAuthenticator(transportHint).createCredential();
  if (result.status === 'failure') return result;
  return {
    status: 'success',
    value: {
      config: result.value.credential,
      followUpRequired: result.value.followUpRequired,
      prfOutput: result.value.prfOutput,
    },
  };
}

export function equalBytes(left: Uint8Array<ArrayBuffer>, right: Uint8Array<ArrayBuffer>) {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((value, index) => value === right[index]);
}
