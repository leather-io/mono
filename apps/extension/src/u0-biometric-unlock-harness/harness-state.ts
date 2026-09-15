import {
  type PlatformUnlockCredentialConfig,
  isPlatformUnlockCredentialConfig,
} from '@shared/crypto/platform-unlock';

import { type TransportHint } from './webauthn-prf';

const harnessEnrollmentStorageKey = 'biometricUnlockU0Enrollment';
export const harnessFixtureStorageKey = 'biometricUnlockU0Fixture';
export const harnessPopupClassifierKey = 'biometricUnlockU0PopupClassifier';
export const harnessSessionReadyKey = 'biometricUnlockU0SessionReady';

interface HarnessEnrollmentState {
  active?: PlatformUnlockCredentialConfig;
  previous?: PlatformUnlockCredentialConfig;
  transportHint: TransportHint;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTransportHint(value: unknown): value is TransportHint {
  return value === 'omitted' || value === 'internal';
}

export async function readHarnessEnrollmentState(): Promise<HarnessEnrollmentState> {
  const stored = await chrome.storage.local.get(harnessEnrollmentStorageKey);
  const value: unknown = stored[harnessEnrollmentStorageKey];
  if (!isRecord(value)) return { transportHint: 'internal' };
  return {
    active: isPlatformUnlockCredentialConfig(value.active) ? value.active : undefined,
    previous: isPlatformUnlockCredentialConfig(value.previous) ? value.previous : undefined,
    transportHint: isTransportHint(value.transportHint) ? value.transportHint : 'internal',
  };
}

async function writeHarnessEnrollmentState(state: HarnessEnrollmentState) {
  await chrome.storage.local.set({ [harnessEnrollmentStorageKey]: state });
}

export async function saveNewActiveCredential(config: PlatformUnlockCredentialConfig) {
  const current = await readHarnessEnrollmentState();
  await writeHarnessEnrollmentState({
    active: config,
    previous: current.active,
    transportHint: current.transportHint,
  });
}

export async function swapActiveCredential() {
  const current = await readHarnessEnrollmentState();
  if (!current.active || !current.previous) return false;
  await writeHarnessEnrollmentState({
    active: current.previous,
    previous: current.active,
    transportHint: current.transportHint,
  });
  return true;
}

export async function setTransportHint(transportHint: TransportHint) {
  const current = await readHarnessEnrollmentState();
  await writeHarnessEnrollmentState({ ...current, transportHint });
}

export async function clearHarnessState() {
  await chrome.storage.local.remove([harnessEnrollmentStorageKey, harnessFixtureStorageKey]);
  await chrome.storage.session.remove([harnessPopupClassifierKey, harnessSessionReadyKey]);
}
