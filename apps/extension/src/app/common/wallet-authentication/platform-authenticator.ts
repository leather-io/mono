import { base64urlnopad } from '@scure/base';

import {
  type PlatformUnlockCredentialConfig,
  isPlatformUnlockCredentialConfig,
} from '@shared/crypto/platform-unlock';
import { TARGET_BROWSER } from '@shared/environment';

const challengeByteLength = 32;
const userIdByteLength = 32;
const prfInputByteLength = 32;
const prfOutputByteLength = 32;
const registrationTagLength = 6;
const registrationTagAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ceremonyTimeoutMs = 120_000;
const chromiumTargetBrowser = 'chromium';
const rpName = 'Leather';
const userLabelPrefix = 'Leather biometric unlock';

type PlatformAuthenticatorFailureCode =
  | 'cancelled-or-timeout'
  | 'credential-mismatch'
  | 'invalid-config'
  | 'prf-unavailable'
  | 'unavailable'
  | 'unsupported-browser';

interface PlatformAuthenticatorFailure {
  status: 'failure';
  code: PlatformAuthenticatorFailureCode;
}

interface PlatformAuthenticatorSuccess<T> {
  status: 'success';
  value: T;
}

type PlatformAuthenticatorResult<T> =
  | PlatformAuthenticatorFailure
  | PlatformAuthenticatorSuccess<T>;

interface PlatformAuthenticatorEnrollment {
  credential: PlatformUnlockCredentialConfig;
  followUpRequired: boolean;
  prfOutput: Uint8Array<ArrayBuffer>;
}

interface PlatformAuthenticatorEvaluation {
  prfOutput: Uint8Array<ArrayBuffer>;
}

interface CreationRequest {
  prfInput: Uint8Array<ArrayBuffer>;
  publicKey: PublicKeyCredentialCreationOptions;
  registrationTag: string;
}

function generateRandomBytes(byteLength: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(byteLength));
}

function generateRegistrationTag() {
  return Array.from(generateRandomBytes(registrationTagLength), value =>
    registrationTagAlphabet.charAt(value % registrationTagAlphabet.length)
  ).join('');
}

export function getPlatformCredentialUserLabel(registrationTag: string) {
  return `${userLabelPrefix} · ${registrationTag}`;
}

function copyBufferSource(source: BufferSource): Uint8Array<ArrayBuffer> {
  if (source instanceof ArrayBuffer) return new Uint8Array(source.slice(0));
  return new Uint8Array(new Uint8Array(source.buffer, source.byteOffset, source.byteLength));
}

function isPublicKeyCredential(credential: Credential | null): credential is PublicKeyCredential {
  return (
    credential !== null &&
    'rawId' in credential &&
    credential.rawId instanceof ArrayBuffer &&
    'getClientExtensionResults' in credential &&
    typeof credential.getClientExtensionResults === 'function'
  );
}

function extractPrfOutput(credential: PublicKeyCredential) {
  const output = credential.getClientExtensionResults().prf?.results?.first;
  if (!output) return;
  const bytes = copyBufferSource(output);
  return bytes.byteLength === prfOutputByteLength ? bytes : undefined;
}

function mapCeremonyError(error: unknown): PlatformAuthenticatorFailure {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return { status: 'failure', code: 'cancelled-or-timeout' };
  }
  return { status: 'failure', code: 'unavailable' };
}

export function canUsePlatformAuthenticator() {
  return (
    TARGET_BROWSER === chromiumTargetBrowser &&
    typeof navigator !== 'undefined' &&
    typeof PublicKeyCredential !== 'undefined' &&
    !!navigator.credentials
  );
}

function buildCredentialCreationRequest(): CreationRequest {
  const prfInput = generateRandomBytes(prfInputByteLength);
  const registrationTag = generateRegistrationTag();
  const userLabel = getPlatformCredentialUserLabel(registrationTag);
  return {
    prfInput,
    publicKey: {
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'discouraged',
        userVerification: 'required',
      },
      challenge: generateRandomBytes(challengeByteLength),
      extensions: { prf: { eval: { first: prfInput } } },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      rp: { name: rpName },
      timeout: ceremonyTimeoutMs,
      user: {
        displayName: userLabel,
        id: generateRandomBytes(userIdByteLength),
        name: userLabel,
      },
    },
    registrationTag,
  };
}

function buildCredentialRequestOptions(
  credential: PlatformUnlockCredentialConfig
): PlatformAuthenticatorResult<PublicKeyCredentialRequestOptions> {
  if (!isPlatformUnlockCredentialConfig(credential)) {
    return { status: 'failure', code: 'invalid-config' };
  }
  return {
    status: 'success',
    value: {
      allowCredentials: [
        {
          id: new Uint8Array(base64urlnopad.decode(credential.credentialId)),
          transports: ['internal'],
          type: 'public-key',
        },
      ],
      challenge: generateRandomBytes(challengeByteLength),
      extensions: {
        prf: {
          eval: {
            first: new Uint8Array(base64urlnopad.decode(credential.prfInput)),
          },
        },
      },
      timeout: ceremonyTimeoutMs,
      userVerification: 'required',
    },
  };
}

export async function evaluatePlatformCredential(
  credentialConfig: PlatformUnlockCredentialConfig
): Promise<PlatformAuthenticatorResult<PlatformAuthenticatorEvaluation>> {
  if (!canUsePlatformAuthenticator()) {
    return { status: 'failure', code: 'unsupported-browser' };
  }
  const request = buildCredentialRequestOptions(credentialConfig);
  if (request.status === 'failure') return request;
  try {
    const credential = await navigator.credentials.get({ publicKey: request.value });
    if (!isPublicKeyCredential(credential)) {
      return { status: 'failure', code: 'unavailable' };
    }
    const returnedCredentialId = base64urlnopad.encode(new Uint8Array(credential.rawId));
    if (returnedCredentialId !== credentialConfig.credentialId) {
      return { status: 'failure', code: 'credential-mismatch' };
    }
    const prfOutput = extractPrfOutput(credential);
    if (!prfOutput) return { status: 'failure', code: 'prf-unavailable' };
    return { status: 'success', value: { prfOutput } };
  } catch (error) {
    return mapCeremonyError(error);
  }
}

export async function createPlatformCredential(): Promise<
  PlatformAuthenticatorResult<PlatformAuthenticatorEnrollment>
> {
  if (!canUsePlatformAuthenticator()) {
    return { status: 'failure', code: 'unsupported-browser' };
  }
  const request = buildCredentialCreationRequest();
  try {
    const credential = await navigator.credentials.create({ publicKey: request.publicKey });
    if (!isPublicKeyCredential(credential)) {
      return { status: 'failure', code: 'unavailable' };
    }
    const credentialConfig = {
      credentialId: base64urlnopad.encode(new Uint8Array(credential.rawId)),
      prfInput: base64urlnopad.encode(request.prfInput),
      registrationTag: request.registrationTag,
    };
    if (!isPlatformUnlockCredentialConfig(credentialConfig)) {
      return { status: 'failure', code: 'invalid-config' };
    }
    const creationPrfOutput = extractPrfOutput(credential);
    if (creationPrfOutput) {
      return {
        status: 'success',
        value: {
          credential: credentialConfig,
          followUpRequired: false,
          prfOutput: creationPrfOutput,
        },
      };
    }
    const evaluation = await evaluatePlatformCredential(credentialConfig);
    if (evaluation.status === 'failure') return evaluation;
    return {
      status: 'success',
      value: {
        credential: credentialConfig,
        followUpRequired: true,
        prfOutput: evaluation.value.prfOutput,
      },
    };
  } catch (error) {
    return mapCeremonyError(error);
  }
}
