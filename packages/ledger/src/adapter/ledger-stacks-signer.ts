import { bytesToHex } from '@noble/hashes/utils';
import { signatureVrsToRsv } from '@stacks/common';
import { type StacksTransactionWire, serializeCV } from '@stacks/transactions';

import { createDescriptor, createKeyOriginPath } from '@leather.io/crypto';
import { type SignatureData, makeStxDerivationPathForType } from '@leather.io/stacks';

import type { LedgerStacksApp } from '../app/ledger-app';
import type {
  HardwareStacksAccountKey,
  HardwareStacksSigner,
  RequestStacksAccountKeysArgs,
  ShowStacksAddressArgs,
  SignStacksMessageArgs,
  SignStacksStructuredMessageArgs,
  SignStacksTransactionArgs,
} from '../contract/hardware-wallet';
import { ensureNotAborted } from '../contract/hardware-wallet-errors';
import type { OperationContext } from '../contract/hardware-wallet-interaction';
import {
  requestPublicKeyForStxAccount,
  showStxAddressOnDevice,
  signLedgerStacksStructuredMessage,
  signLedgerStacksTransaction,
  signLedgerStacksUtf8Message,
  signStacksTransactionWithSignature,
  stacksChainIdToSingleSigAddressVersion,
} from '../stacks/stacks-ledger-utils';
import { ensureStacksAppResponseSucceeded, toLedgerHardwareWalletError } from './ledger-errors';

async function getStacksMasterFingerprintHex({ app }: LedgerStacksApp): Promise<string> {
  const response = await app.getMasterFingerprint();
  ensureStacksAppResponseSucceeded(response);
  return bytesToHex(response.fingerprint);
}

async function requestAccountKeys(
  stacksApp: LedgerStacksApp,
  { derivationPathType, accountIndexes, onRequestKey }: RequestStacksAccountKeysArgs,
  ctx: OperationContext
) {
  const fingerprint = await getStacksMasterFingerprintHex(stacksApp);
  const keys: HardwareStacksAccountKey[] = [];
  for (const accountIndex of accountIndexes) {
    ensureNotAborted(ctx.signal);
    onRequestKey?.(accountIndex);
    const path = makeStxDerivationPathForType(derivationPathType, accountIndex);
    const response = await requestPublicKeyForStxAccount(stacksApp)(path);
    ensureStacksAppResponseSucceeded(response);
    const publicKey = response.publicKey.toString('hex');
    const descriptor = createDescriptor(createKeyOriginPath(fingerprint, path), publicKey);
    keys.push({ accountIndex, path, publicKey, descriptor });
  }
  return { fingerprint, keys };
}

async function signTransaction(
  stacksApp: LedgerStacksApp,
  { transaction, key }: SignStacksTransactionArgs,
  ctx: OperationContext
): Promise<StacksTransactionWire> {
  ctx.onInteraction?.({ type: 'confirm-on-device' });
  const response = await signLedgerStacksTransaction(stacksApp)(
    Buffer.from(transaction.serializeBytes()),
    key.derivationPath
  );
  ensureStacksAppResponseSucceeded(response);
  return signStacksTransactionWithSignature(transaction.serialize(), response.signatureVRS);
}

async function signMessage(
  stacksApp: LedgerStacksApp,
  { message, key }: SignStacksMessageArgs,
  ctx: OperationContext
): Promise<SignatureData> {
  ctx.onInteraction?.({ type: 'confirm-on-device' });
  const response = await signLedgerStacksUtf8Message(stacksApp)(message, key.derivationPath);
  ensureStacksAppResponseSucceeded(response);
  return {
    signature: signatureVrsToRsv(response.signatureVRS.toString('hex')),
    publicKey: key.publicKey,
  };
}

async function signStructuredMessage(
  stacksApp: LedgerStacksApp,
  { message, domain, key }: SignStacksStructuredMessageArgs,
  ctx: OperationContext
): Promise<SignatureData> {
  ctx.onInteraction?.({ type: 'confirm-on-device' });
  const response = await signLedgerStacksStructuredMessage(stacksApp)(
    serializeCV(domain),
    serializeCV(message),
    key.derivationPath
  );
  ensureStacksAppResponseSucceeded(response);
  return {
    signature: signatureVrsToRsv(response.signatureVRS.toString('hex')),
    publicKey: key.publicKey,
  };
}

async function showAddress(
  stacksApp: LedgerStacksApp,
  { derivationPath, chainId }: ShowStacksAddressArgs,
  ctx: OperationContext
): Promise<string> {
  ctx.onInteraction?.({ type: 'verify-address' });
  const response = await showStxAddressOnDevice(stacksApp)(
    derivationPath,
    stacksChainIdToSingleSigAddressVersion(chainId)
  );
  ensureStacksAppResponseSucceeded(response);
  return response.address;
}

async function runStacksOperation<T>(
  ctx: OperationContext,
  operation: () => Promise<T>
): Promise<T> {
  ensureNotAborted(ctx.signal);
  try {
    return await operation();
  } catch (error) {
    throw toLedgerHardwareWalletError(error);
  }
}

export function getLedgerStacksMasterFingerprint(
  stacksApp: LedgerStacksApp,
  ctx: OperationContext
): Promise<string> {
  return runStacksOperation(ctx, () => getStacksMasterFingerprintHex(stacksApp));
}

export function createLedgerStacksSigner(stacksApp: LedgerStacksApp): HardwareStacksSigner {
  return {
    requestAccountKeys(args, ctx) {
      return runStacksOperation(ctx, () => requestAccountKeys(stacksApp, args, ctx));
    },
    signTransaction(args, ctx) {
      return runStacksOperation(ctx, () => signTransaction(stacksApp, args, ctx));
    },
    signMessage(args, ctx) {
      return runStacksOperation(ctx, () => signMessage(stacksApp, args, ctx));
    },
    signStructuredMessage(args, ctx) {
      return runStacksOperation(ctx, () => signStructuredMessage(stacksApp, args, ctx));
    },
    showAddress(args, ctx) {
      return runStacksOperation(ctx, () => showAddress(stacksApp, args, ctx));
    },
  };
}
