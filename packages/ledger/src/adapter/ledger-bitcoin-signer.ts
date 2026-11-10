import { WalletPolicy } from '@ledgerhq/device-signer-kit-bitcoin';
import { bytesToHex } from '@noble/hashes/utils';
import { Psbt } from 'bitcoinjs-lib';

import {
  ecdsaPublicKeyToSchnorr,
  getBitcoinJsLibNetworkConfigByMode,
  inferPaymentTypeFromPath,
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import { extractAccountIndexFromPath } from '@leather.io/crypto';
import type { BitcoinNetworkModes } from '@leather.io/models';

import type { LedgerBitcoinApp } from '../app/ledger-app';
import {
  addNativeSegwitSignaturesToPsbt,
  addTaprootInputSignaturesToPsbt,
  createNativeSegwitWalletPolicyKey,
  createTaprootWalletPolicyKey,
  makeNativeSegwitDefaultWallet,
  makeTaprootDefaultWallet,
} from '../bitcoin/bitcoin-ledger-utils';
import {
  getExtendedPublicKey,
  getMasterFingerprintHex,
  getWalletAddressOnDevice,
  registerWalletPolicy,
  signPsbtWithWallet,
} from '../bitcoin/bitcoin-signer-kit-utils';
import { buildLedgerWalletPolicy } from '../bitcoin/ledger-wallet-policy';
import type {
  HardwareBitcoinAccountKey,
  HardwareBitcoinAccountStandard,
  HardwareBitcoinInputToSign,
  HardwareBitcoinSigner,
  RequestBitcoinAccountKeysArgs,
  ShowBitcoinAddressArgs,
  SignBitcoinPsbtArgs,
} from '../contract/hardware-wallet';
import { HardwareWalletError, ensureNotAborted } from '../contract/hardware-wallet-errors';
import type { OperationContext } from '../contract/hardware-wallet-interaction';
import { toLedgerHardwareWalletError } from './ledger-errors';
import { makeInteractionForwarder } from './ledger-interaction';
import { makeAbortableRunAction } from './ledger-run-action';

const accountStandards = {
  nativeSegwit: {
    makePath: makeNativeSegwitAccountDerivationPath,
    makePolicyKey: createNativeSegwitWalletPolicyKey,
    makeDefaultWallet: makeNativeSegwitDefaultWallet,
  },
  taproot: {
    makePath: makeTaprootAccountDerivationPath,
    makePolicyKey: createTaprootWalletPolicyKey,
    makeDefaultWallet: makeTaprootDefaultWallet,
  },
} as const;

function standardFromPath(path: string): HardwareBitcoinAccountStandard {
  const paymentType = inferPaymentTypeFromPath(path);
  if (paymentType === 'p2wpkh') return 'nativeSegwit';
  if (paymentType === 'p2tr') return 'taproot';
  throw new HardwareWalletError('unsupported', {
    message: `Ledger cannot sign ${paymentType} inputs without a policy descriptor`,
  });
}

interface SigningGroup {
  standard: HardwareBitcoinAccountStandard;
  accountIndex: number;
  inputs: HardwareBitcoinInputToSign[];
}

function groupInputsByWallet(inputs: HardwareBitcoinInputToSign[]): SigningGroup[] {
  const groups = new Map<string, SigningGroup>();
  for (const input of inputs) {
    const standard = standardFromPath(input.derivationPath);
    const accountIndex = extractAccountIndexFromPath(input.derivationPath);
    const key = `${standard}:${accountIndex}`;
    const group = groups.get(key) ?? { standard, accountIndex, inputs: [] };
    group.inputs.push(input);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function hasDerivationForPubkey(entries: { pubkey: Uint8Array }[] | undefined, pubkey: Uint8Array) {
  const pubkeyHex = bytesToHex(pubkey);
  return entries?.some(entry => bytesToHex(entry.pubkey) === pubkeyHex) ?? false;
}

function addNativeSegwitDerivations(
  psbt: Psbt,
  fingerprint: string,
  inputs: HardwareBitcoinInputToSign[]
) {
  inputs.forEach(({ index, derivationPath, publicKey }) => {
    if (hasDerivationForPubkey(psbt.data.inputs[index]?.bip32Derivation, publicKey)) return;
    psbt.updateInput(index, {
      bip32Derivation: [
        {
          masterFingerprint: Buffer.from(fingerprint, 'hex'),
          pubkey: Buffer.from(publicKey),
          path: derivationPath,
        },
      ],
    });
  });
}

function addTaprootDerivations(
  psbt: Psbt,
  fingerprint: string,
  inputs: HardwareBitcoinInputToSign[]
) {
  inputs.forEach(({ index, derivationPath, publicKey }) => {
    const schnorrPubkey = ecdsaPublicKeyToSchnorr(publicKey);
    if (hasDerivationForPubkey(psbt.data.inputs[index]?.tapBip32Derivation, schnorrPubkey)) return;
    psbt.updateInput(index, {
      tapBip32Derivation: [
        {
          masterFingerprint: Buffer.from(fingerprint, 'hex'),
          pubkey: Buffer.from(schnorrPubkey),
          path: derivationPath,
          leafHashes: [],
        },
      ],
    });
  });
}

function stripOwnPartialSignatures(psbt: Psbt, inputs: HardwareBitcoinInputToSign[]) {
  inputs.forEach(({ index, publicKey }) => {
    const input = psbt.data.inputs[index];
    if (!input?.partialSig?.length) return;
    const ownPubkeyHex = bytesToHex(publicKey);
    const remaining = input.partialSig.filter(sig => bytesToHex(sig.pubkey) !== ownPubkeyHex);
    if (remaining.length === input.partialSig.length) return;
    if (remaining.length) input.partialSig = remaining;
    else delete input.partialSig;
  });
}

function withOperationContext(app: LedgerBitcoinApp, ctx: OperationContext): LedgerBitcoinApp {
  return { ...app, runAction: makeAbortableRunAction(ctx.signal) };
}

async function registerPolicy(app: LedgerBitcoinApp, descriptor: string, ctx: OperationContext) {
  const fingerprint = await getMasterFingerprintHex(app);
  const policy = buildLedgerWalletPolicy(descriptor, fingerprint);
  const registered = await registerWalletPolicy(
    app,
    new WalletPolicy(policy.name, policy.descriptorTemplate, policy.keys),
    { onRequiredUserInteraction: makeInteractionForwarder(ctx) }
  );
  return { fingerprint, registered };
}

async function requestAccountKeys(
  app: LedgerBitcoinApp,
  { network, accountIndexes, standards, onRequestKey }: RequestBitcoinAccountKeysArgs,
  ctx: OperationContext
) {
  const fingerprint = await getMasterFingerprintHex(app);
  const keys: HardwareBitcoinAccountKey[] = [];
  for (const standard of standards) {
    for (const accountIndex of accountIndexes) {
      ensureNotAborted(ctx.signal);
      onRequestKey?.({ standard, accountIndex });
      const path = accountStandards[standard].makePath(network, accountIndex);
      const xpub = await getExtendedPublicKey(app, path);
      const descriptor = accountStandards[standard].makePolicyKey({
        network,
        accountIndex,
        fingerprint,
        xpub,
      });
      keys.push({ standard, accountIndex, path, xpub, descriptor });
    }
  }
  return { fingerprint, keys };
}

async function signWithDefaultWallets(
  app: LedgerBitcoinApp,
  psbt: Psbt,
  network: BitcoinNetworkModes,
  fingerprint: string,
  inputsToSign: HardwareBitcoinInputToSign[],
  ctx: OperationContext
) {
  const options = { onRequiredUserInteraction: makeInteractionForwarder(ctx) };
  for (const group of groupInputsByWallet(inputsToSign)) {
    ensureNotAborted(ctx.signal);
    const wallet = accountStandards[group.standard].makeDefaultWallet(network, group.accountIndex);
    if (group.standard === 'taproot') {
      addTaprootDerivations(psbt, fingerprint, group.inputs);
      const signatures = await signPsbtWithWallet(app, wallet, psbt.toBase64(), options);
      addTaprootInputSignaturesToPsbt(psbt, signatures);
      continue;
    }
    addNativeSegwitDerivations(psbt, fingerprint, group.inputs);
    const signatures = await signPsbtWithWallet(app, wallet, psbt.toBase64(), options);
    addNativeSegwitSignaturesToPsbt(psbt, signatures);
  }
}

async function signWithPolicy(
  app: LedgerBitcoinApp,
  psbt: Psbt,
  policyDescriptor: string,
  inputsToSign: HardwareBitcoinInputToSign[],
  ctx: OperationContext
) {
  const { fingerprint, registered } = await registerPolicy(app, policyDescriptor, ctx);
  addNativeSegwitDerivations(psbt, fingerprint, inputsToSign);
  stripOwnPartialSignatures(psbt, inputsToSign);
  const signatures = await signPsbtWithWallet(app, registered, psbt.toBase64(), {
    onRequiredUserInteraction: makeInteractionForwarder(ctx),
  });
  addNativeSegwitSignaturesToPsbt(psbt, signatures);
}

async function signPsbt(
  app: LedgerBitcoinApp,
  { psbt: rawPsbt, network, inputsToSign, policyDescriptor }: SignBitcoinPsbtArgs,
  ctx: OperationContext
): Promise<Uint8Array> {
  const psbt = Psbt.fromBuffer(Buffer.from(rawPsbt), {
    network: getBitcoinJsLibNetworkConfigByMode(network),
  });
  if (policyDescriptor) {
    await signWithPolicy(app, psbt, policyDescriptor, inputsToSign, ctx);
  } else {
    const fingerprint = await getMasterFingerprintHex(app);
    await signWithDefaultWallets(app, psbt, network, fingerprint, inputsToSign, ctx);
  }
  return new Uint8Array(psbt.toBuffer());
}

async function showAddress(
  app: LedgerBitcoinApp,
  args: ShowBitcoinAddressArgs,
  ctx: OperationContext
): Promise<string> {
  const indexes = { changeIndex: args.changeIndex, addressIndex: args.addressIndex };
  const options = { onRequiredUserInteraction: makeInteractionForwarder(ctx) };
  if (args.kind === 'policy') {
    const { registered } = await registerPolicy(app, args.policyDescriptor, ctx);
    return getWalletAddressOnDevice(app, registered, indexes, options);
  }
  const wallet = accountStandards[args.standard].makeDefaultWallet(args.network, args.accountIndex);
  return getWalletAddressOnDevice(app, wallet, indexes, options);
}

async function runBitcoinOperation<T>(
  app: LedgerBitcoinApp,
  ctx: OperationContext,
  operation: (app: LedgerBitcoinApp) => Promise<T>
): Promise<T> {
  ensureNotAborted(ctx.signal);
  try {
    return await operation(withOperationContext(app, ctx));
  } catch (error) {
    throw toLedgerHardwareWalletError(error);
  }
}

export function getLedgerBitcoinMasterFingerprint(
  app: LedgerBitcoinApp,
  ctx: OperationContext
): Promise<string> {
  return runBitcoinOperation(app, ctx, getMasterFingerprintHex);
}

export function createLedgerBitcoinSigner(app: LedgerBitcoinApp): HardwareBitcoinSigner {
  return {
    requestAccountKeys(args, ctx) {
      return runBitcoinOperation(app, ctx, scopedApp => requestAccountKeys(scopedApp, args, ctx));
    },
    signPsbt(args, ctx) {
      return runBitcoinOperation(app, ctx, scopedApp => signPsbt(scopedApp, args, ctx));
    },
    showAddress(args, ctx) {
      return runBitcoinOperation(app, ctx, scopedApp => showAddress(scopedApp, args, ctx));
    },
  };
}
