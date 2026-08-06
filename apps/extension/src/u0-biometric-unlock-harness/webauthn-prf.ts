import { base64urlnopad } from '@scure/base';

const challengeByteLength = 32;
const userIdByteLength = 32;
const prfInputByteLength = 32;
const prfOutputByteLength = 32;
const registrationTagLength = 6;
const registrationTagAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ceremonyTimeoutMs = 120_000;

export const rpName = 'Leather biometric unlock test';
export const userLabelPrefix = 'Leather biometric unlock test';

export type TransportHint = 'omitted' | 'internal';

type PrfFailureCode =
  | 'cancelled-or-timeout'
  | 'credential-mismatch'
  | 'invalid-config'
  | 'prf-unavailable'
  | 'unavailable';

interface PrfFailure {
  status: 'failure';
  code: PrfFailureCode;
}

interface PrfSuccess<T> {
  status: 'success';
  value: T;
}

export type PrfResult<T> = PrfFailure | PrfSuccess<T>;

export interface PrfCredentialConfig {
  credentialId: string;
  prfInput: string;
  registrationTag: string;
}

interface PrfEnrollment {
  config: PrfCredentialConfig;
  followUpRequired: boolean;
  prfOutput: Uint8Array<ArrayBuffer>;
}

export interface PrfEvaluation {
  prfOutput: Uint8Array<ArrayBuffer>;
}

interface CreationRequest {
  prfInput: Uint8Array<ArrayBuffer>;
  publicKey: PublicKeyCredentialCreationOptions;
  registrationTag: string;
}

export function generateRandomBytes(byteLength: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(byteLength));
}

export function isRegistrationTag(value: unknown): value is string {
  return typeof value === 'string' && /^[A-HJ-NP-Z2-9]{6}$/.test(value);
}

function generateRegistrationTag() {
  return Array.from(generateRandomBytes(registrationTagLength), value =>
    registrationTagAlphabet.charAt(value % registrationTagAlphabet.length)
  ).join('');
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

function encodeBytes(bytes: Uint8Array) {
  return base64urlnopad.encode(bytes);
}

function decodeBytes(value: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(base64urlnopad.decode(value));
}

function extractPrfOutput(credential: PublicKeyCredential) {
  const output = credential.getClientExtensionResults().prf?.results?.first;
  if (!output) return;
  const bytes = copyBufferSource(output);
  if (bytes.byteLength !== prfOutputByteLength) return;
  return bytes;
}

function mapCeremonyError(error: unknown): PrfFailure {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return { status: 'failure', code: 'cancelled-or-timeout' };
  }
  return { status: 'failure', code: 'unavailable' };
}

function buildCredentialCreationRequest(): CreationRequest {
  const prfInput = generateRandomBytes(prfInputByteLength);
  const registrationTag = generateRegistrationTag();
  const userLabel = `${userLabelPrefix} · ${registrationTag}`;
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
      extensions: {
        prf: {
          eval: {
            first: prfInput,
          },
        },
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      rp: {
        name: rpName,
      },
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
  config: PrfCredentialConfig,
  transportHint: TransportHint,
  prfInputOverride?: Uint8Array<ArrayBuffer>
): PrfResult<PublicKeyCredentialRequestOptions> {
  try {
    const credentialId = decodeBytes(config.credentialId);
    const persistedPrfInput = decodeBytes(config.prfInput);
    const prfInput = prfInputOverride ?? persistedPrfInput;
    if (
      credentialId.byteLength === 0 ||
      prfInput.byteLength !== prfInputByteLength ||
      !isRegistrationTag(config.registrationTag)
    ) {
      return { status: 'failure', code: 'invalid-config' };
    }
    const credential: PublicKeyCredentialDescriptor =
      transportHint === 'internal'
        ? { id: credentialId, transports: ['internal'], type: 'public-key' }
        : { id: credentialId, type: 'public-key' };
    return {
      status: 'success',
      value: {
        allowCredentials: [credential],
        challenge: generateRandomBytes(challengeByteLength),
        extensions: {
          prf: {
            eval: {
              first: prfInput,
            },
          },
        },
        timeout: ceremonyTimeoutMs,
        userVerification: 'required',
      },
    };
  } catch {
    return { status: 'failure', code: 'invalid-config' };
  }
}

export async function evaluatePrfCredential(
  config: PrfCredentialConfig,
  transportHint: TransportHint,
  prfInputOverride?: Uint8Array<ArrayBuffer>
): Promise<PrfResult<PrfEvaluation>> {
  const request = buildCredentialRequestOptions(config, transportHint, prfInputOverride);
  if (request.status === 'failure') return request;
  try {
    const credential = await navigator.credentials.get({ publicKey: request.value });
    if (!isPublicKeyCredential(credential)) {
      return { status: 'failure', code: 'unavailable' };
    }
    const returnedCredentialId = encodeBytes(new Uint8Array(credential.rawId));
    if (returnedCredentialId !== config.credentialId) {
      return { status: 'failure', code: 'credential-mismatch' };
    }
    const prfOutput = extractPrfOutput(credential);
    if (!prfOutput) return { status: 'failure', code: 'prf-unavailable' };
    return { status: 'success', value: { prfOutput } };
  } catch (error) {
    return mapCeremonyError(error);
  }
}

export async function createPrfEnrollment(
  transportHint: TransportHint
): Promise<PrfResult<PrfEnrollment>> {
  const request = buildCredentialCreationRequest();
  try {
    const credential = await navigator.credentials.create({ publicKey: request.publicKey });
    if (!isPublicKeyCredential(credential)) {
      return { status: 'failure', code: 'unavailable' };
    }
    const config = {
      credentialId: encodeBytes(new Uint8Array(credential.rawId)),
      prfInput: encodeBytes(request.prfInput),
      registrationTag: request.registrationTag,
    };
    const creationPrfOutput = extractPrfOutput(credential);
    if (creationPrfOutput) {
      return {
        status: 'success',
        value: { config, followUpRequired: false, prfOutput: creationPrfOutput },
      };
    }
    const evaluation = await evaluatePrfCredential(config, transportHint);
    if (evaluation.status === 'failure') {
      return { status: 'failure', code: evaluation.code };
    }
    return {
      status: 'success',
      value: {
        config,
        followUpRequired: true,
        prfOutput: evaluation.value.prfOutput,
      },
    };
  } catch (error) {
    return mapCeremonyError(error);
  }
}

export function equalBytes(left: Uint8Array<ArrayBuffer>, right: Uint8Array<ArrayBuffer>) {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((value, index) => value === right[index]);
}
