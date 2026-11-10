import {
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractKeyFromDescriptor,
} from '@leather.io/crypto';
import {
  type StacksDerivationPathType,
  inferStacksDerivationPathType,
  isStacksDerivationPathType,
  makeStxDerivationPath,
} from '@leather.io/stacks';

import { assumedZeroFingerprint } from '@shared/utils';

interface ResolveLedgerStacksDerivationPathTypeArgs {
  stxKeychainDescriptors: string[];
  fingerprint: string;
  hasWalletForFingerprint: boolean;
  legacyWalletMatchesDevice: boolean;
  chosenDerivationPathType: unknown;
}
interface LedgerStacksDerivationPathTypeResolved {
  status: 'resolved';
  derivationPathType: StacksDerivationPathType;
  overriddenChosenType: StacksDerivationPathType | null;
}
interface LedgerStacksDerivationPathTypeNeedsChoice {
  status: 'needs-choice';
}
type LedgerStacksDerivationPathTypeResolution =
  | LedgerStacksDerivationPathTypeResolved
  | LedgerStacksDerivationPathTypeNeedsChoice;
export function resolveLedgerStacksDerivationPathType({
  stxKeychainDescriptors,
  fingerprint,
  hasWalletForFingerprint,
  legacyWalletMatchesDevice,
  chosenDerivationPathType,
}: ResolveLedgerStacksDerivationPathTypeArgs): LedgerStacksDerivationPathTypeResolution {
  const inferenceDescriptors = stxKeychainDescriptors.filter(descriptor => {
    const descriptorFingerprint = extractFingerprintFromDescriptor(descriptor);
    if (descriptorFingerprint === fingerprint) return true;
    return (
      !hasWalletForFingerprint &&
      legacyWalletMatchesDevice &&
      descriptorFingerprint === assumedZeroFingerprint
    );
  });

  const chosenType = isStacksDerivationPathType(chosenDerivationPathType)
    ? chosenDerivationPathType
    : null;

  const inferredType = inferStacksDerivationPathType(inferenceDescriptors);
  if (inferredType)
    return {
      status: 'resolved',
      derivationPathType: inferredType,
      overriddenChosenType: chosenType && chosenType !== inferredType ? chosenType : null,
    };

  if (!chosenType) return { status: 'needs-choice' };

  return { status: 'resolved', derivationPathType: chosenType, overriddenChosenType: null };
}

const accountZeroStxPath = makeStxDerivationPath(0);

export async function deviceMatchesLegacyLedgerWallet(
  requestLegacyAccountZeroPublicKey: () => Promise<string | null>,
  stxKeychainDescriptors: string[]
): Promise<boolean> {
  const legacyAccountZeroKeys = stxKeychainDescriptors
    .filter(descriptor => extractFingerprintFromDescriptor(descriptor) === assumedZeroFingerprint)
    .filter(descriptor => extractDerivationPathFromDescriptor(descriptor) === accountZeroStxPath)
    .map(descriptor => extractKeyFromDescriptor(descriptor));

  if (legacyAccountZeroKeys.length === 0) return true;

  const publicKey = await requestLegacyAccountZeroPublicKey();
  if (!publicKey) return true;

  return legacyAccountZeroKeys.includes(publicKey);
}
