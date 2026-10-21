import { isError } from '@leather.io/utils';

export const hardwareWalletErrorKinds = [
  'locked',
  'disconnected',
  'rejected',
  'not-paired',
  'no-device-selected',
  'busy',
  'wrong-app',
  'outdated-app',
  'invalid-payload',
  'cancelled',
  'unsupported',
  'unknown',
] as const;

export type HardwareWalletErrorKind = (typeof hardwareWalletErrorKinds)[number];

export interface OutdatedAppDetails {
  currentVersion: string;
  requiredVersion: string;
}

interface HardwareWalletErrorOptions {
  message?: string;
  cause?: unknown;
  details?: OutdatedAppDetails;
}

const hardwareWalletErrorName = 'HardwareWalletError';

const defaultMessages: Record<HardwareWalletErrorKind, string> = {
  locked: 'The hardware wallet is locked',
  disconnected: 'The hardware wallet was disconnected',
  rejected: 'The operation was rejected on the hardware wallet',
  'not-paired': 'No hardware wallet has been paired',
  'no-device-selected': 'No hardware wallet was selected',
  busy: 'The hardware wallet is in use by another application',
  'wrong-app': 'The required app is not open on the hardware wallet',
  'outdated-app': 'The app on the hardware wallet is outdated',
  'invalid-payload': 'The hardware wallet rejected the payload as invalid',
  cancelled: 'The hardware wallet operation was cancelled',
  unsupported: 'The hardware wallet does not support this operation',
  unknown: 'Unknown hardware wallet error',
};

export class HardwareWalletError extends Error {
  readonly kind: HardwareWalletErrorKind;
  readonly details: OutdatedAppDetails | null;

  constructor(
    kind: HardwareWalletErrorKind,
    { message, cause, details }: HardwareWalletErrorOptions = {}
  ) {
    super(message ?? defaultMessages[kind], { cause });
    this.name = hardwareWalletErrorName;
    this.kind = kind;
    this.details = details ?? null;
  }
}

export function isHardwareWalletError(error: unknown) {
  return error instanceof HardwareWalletError;
}

export function isHardwareWalletErrorOfKind(
  error: unknown,
  kind: HardwareWalletErrorKind
): boolean {
  return isHardwareWalletError(error) && error.kind === kind;
}

export function toHardwareWalletError(error: unknown): HardwareWalletError {
  if (isHardwareWalletError(error)) return error;
  return new HardwareWalletError('unknown', {
    message: isError(error) ? error.message : undefined,
    cause: error,
  });
}

export function ensureNotAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new HardwareWalletError('cancelled');
}
