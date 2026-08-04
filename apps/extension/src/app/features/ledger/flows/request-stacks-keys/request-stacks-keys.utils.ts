import { bytesToHex } from '@noble/hashes/utils';
import * as secp from '@noble/secp256k1';
import StacksApp from '@zondax/ledger-stacks';

import { extractFingerprintFromDescriptor } from '@leather.io/crypto';
import {
  StacksDerivationPathType,
  inferStacksDerivationPathType,
  isStacksDerivationPathType,
  makeStxDerivationPathForType,
} from '@leather.io/stacks';
import { delay } from '@leather.io/utils';

import { getIdentityDerivationPath } from '@shared/crypto/stacks/stacks-address-gen';
import { assumedZeroFingerprint } from '@shared/utils';

import { defaultNumberOfKeysToPullFromLedgerDevice } from '../../generic-flows/request-keys/use-request-ledger-keys';
import {
  StacksAppKeysResponseItem,
  requestPublicKeyForStxAccount,
} from '../../utils/stacks-ledger-utils';

function requestPublicKeyForIdentityAccount(app: StacksApp) {
  return async (index: number) => app.getIdentityPubKey(getIdentityDerivationPath(index));
}

function decompressSecp256k1PublicKey(publicKey: string) {
  const point = secp.ProjectivePoint.fromHex(publicKey);
  return bytesToHex(point.toRawBytes(false));
}

interface PullStacksKeysFromLedgerSuccess {
  status: 'success';
  publicKeys: StacksAppKeysResponseItem[];
}

interface PullStacksKeysFromLedgerFailure {
  status: 'failure';
  errorMessage: string;
  returnCode: number;
}

type PullStacksKeysFromLedgerResponse = Promise<
  PullStacksKeysFromLedgerSuccess | PullStacksKeysFromLedgerFailure
>;

interface ResolveLedgerStacksDerivationPathTypeArgs {
  stxKeychainDescriptors: string[];
  fingerprint: string;
  hasWalletForFingerprint: boolean;
  hasLegacyLedgerWallet: boolean;
  chosenDerivationPathType: unknown;
}
export function resolveLedgerStacksDerivationPathType({
  stxKeychainDescriptors,
  fingerprint,
  hasWalletForFingerprint,
  hasLegacyLedgerWallet,
  chosenDerivationPathType,
}: ResolveLedgerStacksDerivationPathTypeArgs): StacksDerivationPathType {
  const inferenceDescriptors = stxKeychainDescriptors.filter(descriptor => {
    const descriptorFingerprint = extractFingerprintFromDescriptor(descriptor);
    if (descriptorFingerprint === fingerprint) return true;
    return (
      !hasWalletForFingerprint &&
      hasLegacyLedgerWallet &&
      descriptorFingerprint === assumedZeroFingerprint
    );
  });

  const inferredType = inferStacksDerivationPathType(inferenceDescriptors);
  if (inferredType) return inferredType;

  return isStacksDerivationPathType(chosenDerivationPathType) ? chosenDerivationPathType : 'stacks';
}

interface PullStacksKeysFromLedgerDeviceArgs {
  derivationPathType: StacksDerivationPathType;
  onRequestKey?(keyIndex: number): void;
}
export function pullStacksKeysFromLedgerDevice(stacksApp: StacksApp) {
  return async ({
    derivationPathType,
    onRequestKey,
  }: PullStacksKeysFromLedgerDeviceArgs): PullStacksKeysFromLedgerResponse => {
    const publicKeys = [];

    for (let index = 0; index < defaultNumberOfKeysToPullFromLedgerDevice; index++) {
      if (onRequestKey) onRequestKey(index);
      const path = makeStxDerivationPathForType(derivationPathType, index);
      const stxPublicKeyResp = await requestPublicKeyForStxAccount(stacksApp)(path);
      const dataPublicKeyResp = await requestPublicKeyForIdentityAccount(stacksApp)(index);

      if (!stxPublicKeyResp.publicKey) return { status: 'failure', ...stxPublicKeyResp };
      if (!dataPublicKeyResp.publicKey) return { status: 'failure', ...dataPublicKeyResp };

      publicKeys.push({
        path,
        stxPublicKey: stxPublicKeyResp.publicKey.toString('hex'),
        // We return a decompressed public key, to match the behaviour of
        // @stacks/wallet-sdk. I'm not sure why we return an uncompressed key
        // typically compressed keys are used
        dataPublicKey: decompressSecp256k1PublicKey(dataPublicKeyResp.publicKey.toString('hex')),
      });
    }
    await delay(1000);
    return { status: 'success', publicKeys };
  };
}
