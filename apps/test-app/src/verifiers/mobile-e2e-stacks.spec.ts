import {
  TransactionSigner,
  deserializeTransaction,
  getAddressFromPublicKey,
  makeSTXTokenTransfer,
  privateKeyToPublic,
  signMessageHashRsv,
} from '@stacks/transactions';
import { describe, expect, test } from 'vitest';

import {
  buildUnsignedMultisigStxTransferHex,
  buildUnsignedStxTransferHex,
} from '../builders/stx-tx';
import type { RequestContext, VerifyReport } from '../types';
import {
  hashUtf8Message,
  verifyBroadcastTransfer,
  verifyMessageSignature,
  verifyMultisigSignature,
  verifySingleSigSignature,
  verifyStxAddresses,
} from './mobile-e2e-stacks';

const privateKey = `${'11'.repeat(32)}01`;
const otherPrivateKey = `${'22'.repeat(32)}01`;
const publicKey = String(privateKeyToPublic(privateKey));
const otherPublicKey = String(privateKeyToPublic(otherPrivateKey));
const ownAddress = getAddressFromPublicKey(publicKey, 'mainnet');
const recipient = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';

const ctx: RequestContext = {
  network: 'mainnet',
  request() {
    return Promise.resolve({ addresses: [{ symbol: 'STX', address: ownAddress, publicKey }] });
  },
};

function failedLabels(report: VerifyReport) {
  return report.checks.filter(check => !check.ok).map(check => check.label);
}

describe('verifyMessageSignature', () => {
  const message = 'test';
  const hash = hashUtf8Message(message);
  const verify = verifyMessageSignature(() => hash);

  test("accepts a signature by the account's key", async () => {
    const signature = signMessageHashRsv({ messageHash: hash, privateKey });
    const report = await verify({ ctx, params: { message }, result: { signature, publicKey } });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects a valid signature from another key', async () => {
    const signature = signMessageHashRsv({ messageHash: hash, privateKey: otherPrivateKey });
    const report = await verify({
      ctx,
      params: { message },
      result: { signature, publicKey: otherPublicKey },
    });
    expect(failedLabels(report)).toEqual(["publicKey is the account's STX key"]);
  });

  test('rejects a signature that does not recover to the returned key', async () => {
    const signature = signMessageHashRsv({ messageHash: hash, privateKey: otherPrivateKey });
    const report = await verify({ ctx, params: { message }, result: { signature, publicKey } });
    expect(failedLabels(report)).toEqual(['signature recovers to the returned publicKey']);
  });
});

async function unsignedMultisig() {
  return buildUnsignedMultisigStxTransferHex({
    publicKeys: [otherPublicKey, publicKey],
    numSignatures: 2,
    recipient,
    mode: 'mainnet',
    amount: 500n,
  });
}

function signMultisig(txHex: string, key: string) {
  const tx = deserializeTransaction(txHex);
  new TransactionSigner(tx).signOrigin(key);
  return tx.serialize();
}

describe('verifyMultisigSignature', () => {
  test("accepts one added signature by the account's key", async () => {
    const txHex = await unsignedMultisig();
    const report = await verifyMultisigSignature()({
      ctx,
      params: { txHex },
      result: { txHex: signMultisig(txHex, privateKey) },
    });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects a signature from another key', async () => {
    const txHex = await unsignedMultisig();
    const report = await verifyMultisigSignature()({
      ctx,
      params: { txHex },
      result: { txHex: signMultisig(txHex, otherPrivateKey) },
    });
    expect(failedLabels(report)).toEqual([
      "the signature recovers over the sighash to the account's STX key",
    ]);
  });

  test('rejects a signature over a different transaction', async () => {
    const txHex = await unsignedMultisig();
    const otherTx = await buildUnsignedMultisigStxTransferHex({
      publicKeys: [otherPublicKey, publicKey],
      numSignatures: 2,
      recipient,
      mode: 'mainnet',
      amount: 501n,
    });
    const signedOther = deserializeTransaction(signMultisig(otherTx, privateKey));
    const tampered = deserializeTransaction(txHex);
    tampered.auth = signedOther.auth;
    const report = await verifyMultisigSignature()({
      ctx,
      params: { txHex },
      result: { txHex: tampered.serialize() },
    });
    expect(failedLabels(report)).toEqual([
      "the signature recovers over the sighash to the account's STX key",
    ]);
  });
});

async function signedTransfer(memo?: string, senderKey = privateKey) {
  return makeSTXTokenTransfer({
    recipient,
    amount: 100n,
    senderKey,
    fee: 300n,
    nonce: 0n,
    network: 'mainnet',
    ...(memo ? { memo } : {}),
  });
}

describe('verifyBroadcastTransfer', () => {
  test('accepts the requested transfer', async () => {
    const tx = await signedTransfer();
    const report = await verifyBroadcastTransfer()({
      ctx,
      params: { recipient, amount: 100 },
      result: { transaction: tx.serialize(), txid: tx.txid() },
    });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects another recipient', async () => {
    const tx = await signedTransfer();
    const report = await verifyBroadcastTransfer()({
      ctx,
      params: { recipient: ownAddress, amount: 100 },
      result: { transaction: tx.serialize(), txid: tx.txid() },
    });
    expect(failedLabels(report)).toEqual([`recipient is ${ownAddress}`]);
  });

  test('rejects another amount and a missing memo', async () => {
    const tx = await signedTransfer();
    const report = await verifyBroadcastTransfer()({
      ctx,
      params: { recipient, amount: 101, memo: 'mock-memo' },
      result: { transaction: tx.serialize(), txid: tx.txid() },
    });
    expect(failedLabels(report)).toEqual(['amount is 101', 'memo is mock-memo']);
  });

  test('rejects a signature that does not cover the transaction', async () => {
    const tx = await signedTransfer();
    tx.setFee(999n);
    const report = await verifyBroadcastTransfer()({
      ctx,
      params: { recipient, amount: 100 },
      result: { transaction: tx.serialize(), txid: tx.txid() },
    });
    expect(failedLabels(report)).toEqual([
      'signature recovers to the transaction signer',
      "the signature recovers over the sighash to the account's STX key",
    ]);
  });

  test('rejects a valid transfer signed by another key', async () => {
    const tx = await signedTransfer(undefined, otherPrivateKey);
    const report = await verifyBroadcastTransfer()({
      ctx,
      params: { recipient, amount: 100 },
      result: { transaction: tx.serialize(), txid: tx.txid() },
    });
    expect(failedLabels(report)).toEqual([
      "the signature recovers over the sighash to the account's STX key",
    ]);
  });
});

async function unsignedSingleSig(signerPublicKey = publicKey, amount = 500n) {
  return buildUnsignedStxTransferHex({
    publicKey: signerPublicKey,
    recipient,
    mode: 'mainnet',
    amount,
  });
}

function signSingleSig(txHex: string, key: string) {
  const tx = deserializeTransaction(txHex);
  new TransactionSigner(tx).signOrigin(key);
  return tx.serialize();
}

describe('verifySingleSigSignature', () => {
  test("accepts the requested transfer signed by the account's key", async () => {
    const transaction = await unsignedSingleSig();
    const report = await verifySingleSigSignature()({
      ctx,
      params: { transaction },
      result: { transaction: signSingleSig(transaction, privateKey) },
    });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects a transaction signed by another key', async () => {
    const transaction = await unsignedSingleSig();
    const foreign = await unsignedSingleSig(otherPublicKey);
    const report = await verifySingleSigSignature()({
      ctx,
      params: { transaction },
      result: { transaction: signSingleSig(foreign, otherPrivateKey) },
    });
    expect(failedLabels(report)).toEqual([
      'signer unchanged',
      "the signature recovers over the sighash to the account's STX key",
    ]);
  });

  test('rejects a signed transaction with another amount', async () => {
    const transaction = await unsignedSingleSig();
    const other = await unsignedSingleSig(publicKey, 501n);
    const report = await verifySingleSigSignature()({
      ctx,
      params: { transaction },
      result: { transaction: signSingleSig(other, privateKey) },
    });
    expect(failedLabels(report)).toEqual(['amount unchanged']);
  });

  test('rejects an unsigned answer', async () => {
    const transaction = await unsignedSingleSig();
    const report = await verifySingleSigSignature()({
      ctx,
      params: { transaction },
      result: { transaction },
    });
    expect(failedLabels(report)).toEqual([
      'signature recovers to the transaction signer',
      "the signature recovers over the sighash to the account's STX key",
    ]);
  });
});

describe('verifyStxAddresses', () => {
  const entry = { address: ownAddress, publicKey, derivationPath: "m/44'/5757'/0'/0/0" };

  test('accepts one mainnet address matching its key', async () => {
    const report = await verifyStxAddresses(0)({ ctx, params: {}, result: [entry] });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects a public key that does not own the address', async () => {
    const report = await verifyStxAddresses(0)({
      ctx,
      params: {},
      result: [{ ...entry, publicKey: otherPublicKey }],
    });
    expect(failedLabels(report)).toEqual(['address belongs to the returned public key']);
  });

  test('rejects a testnet address, an extra entry and another account', async () => {
    const testnetAddress = getAddressFromPublicKey(publicKey, 'testnet');
    const report = await verifyStxAddresses(0)({
      ctx,
      params: {},
      result: [{ ...entry, address: testnetAddress, derivationPath: "m/44'/5757'/0'/0/1" }, entry],
    });
    expect(failedLabels(report)).toEqual([
      'exactly one STX address',
      'address starts with SP',
      'address belongs to the returned public key',
      'derivation path is a Stacks path at account index 0',
    ]);
  });
});
