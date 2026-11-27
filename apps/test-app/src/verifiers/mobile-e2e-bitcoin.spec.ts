import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { pubECDSA, pubSchnorr } from '@scure/btc-signer/utils';
import { getAddressFromPublicKey } from '@stacks/transactions';
import { describe, expect, test } from 'vitest';

import { buildPsbtScenario } from '../builders/psbt';
import type { RequestContext, VerifyReport } from '../types';
import type { WalletAddress } from '../wallet';
import {
  txidOf,
  verifyAccountAddresses,
  verifyBip322Signature,
  verifyBroadcastPsbt,
  verifyBtcAccountIndex,
  verifyBtcTransfer,
} from './mobile-e2e-bitcoin';
import { parsePsbt } from './psbt-signatures';

const privateKey = hex.decode('1'.repeat(64));
const otherPrivateKey = hex.decode('2'.repeat(64));
const publicKey = pubECDSA(privateKey);
const otherPublicKey = pubECDSA(otherPrivateKey);
const ownAddress = btc.p2wpkh(publicKey).address ?? '';
const otherAddress = btc.p2wpkh(otherPublicKey).address ?? '';

function contextWith(addresses: WalletAddress[]): RequestContext {
  return {
    network: 'mainnet',
    request() {
      return Promise.resolve({ addresses });
    },
  };
}

const ownContext = contextWith([
  { symbol: 'BTC', type: 'p2wpkh', address: ownAddress, publicKey: hex.encode(publicKey) },
]);

function failedLabels(report: VerifyReport) {
  return report.checks.filter(check => !check.ok).map(check => check.label);
}

function psbtFor(key: Uint8Array, inputAmount?: bigint) {
  return buildPsbtScenario(
    {
      inputs: [
        { kind: 'p2wpkh', amount: inputAmount },
        { kind: 'p2tr', amount: inputAmount },
      ],
      outputs: [{ kind: 'foreign', amount: 40_000n }],
    },
    { nativeSegwitPubkey: pubECDSA(key), taprootInternalKey: pubSchnorr(key) }
  ).psbtHex;
}

function signAll(psbtHex: string, key: Uint8Array) {
  const tx = parsePsbt(psbtHex);
  tx.sign(key);
  tx.finalize();
  return tx;
}

describe('verifyBroadcastPsbt', () => {
  const requested = psbtFor(privateKey);
  const requestedTxid = txidOf(parsePsbt(requested));

  test('accepts the signed requested transaction and its txid', async () => {
    const signed = signAll(requested, privateKey);
    const report = await verifyBroadcastPsbt()({
      ctx: ownContext,
      params: { hex: requested },
      result: { hex: signed.hex, txid: signed.id },
    });
    expect(failedLabels(report)).toEqual([]);
    expect(report.ok).toBe(true);
    expect(signed.id).toBe(requestedTxid);
  });

  test('rejects a txid that is not the requested transaction', async () => {
    const signed = signAll(requested, privateKey);
    const report = await verifyBroadcastPsbt()({
      ctx: ownContext,
      params: { hex: requested },
      result: { hex: signed.hex, txid: 'ab'.repeat(32) },
    });
    expect(report.ok).toBe(false);
    expect(failedLabels(report)).toEqual(['txid is the id of the requested transaction']);
  });

  test('rejects a transaction with an unsigned input', async () => {
    const tx = parsePsbt(requested);
    tx.signIdx(privateKey, 0);
    tx.finalizeIdx(0);
    const report = await verifyBroadcastPsbt()({
      ctx: ownContext,
      params: { hex: requested },
      result: { hex: hex.encode(tx.toPSBT()), txid: requestedTxid },
    });
    expect(report.ok).toBe(false);
    expect(failedLabels(report)).toEqual([
      'input 1 carries a valid signature for the requested transaction',
    ]);
  });

  test('rejects signatures from another key', async () => {
    const forged = signAll(psbtFor(otherPrivateKey), otherPrivateKey);
    const report = await verifyBroadcastPsbt()({
      ctx: ownContext,
      params: { hex: requested },
      result: { hex: forged.hex, txid: forged.id },
    });
    expect(forged.id).toBe(requestedTxid);
    expect(report.ok).toBe(false);
    expect(failedLabels(report)).toEqual([
      'input 0 carries a valid signature for the requested transaction',
      'input 1 carries a valid signature for the requested transaction',
    ]);
  });

  test('rejects signatures over a different digest', async () => {
    const wrongDigest = signAll(psbtFor(privateKey, 90_000n), privateKey);
    const report = await verifyBroadcastPsbt()({
      ctx: ownContext,
      params: { hex: requested },
      result: { hex: wrongDigest.hex, txid: wrongDigest.id },
    });
    expect(report.ok).toBe(false);
    expect(failedLabels(report)).toHaveLength(2);
  });
});

const prevoutSats = 10_000n;

interface TransferInput {
  signer: Uint8Array;
  signedSats?: bigint;
}

function transfer(
  outputs: { address: string; amount: bigint }[],
  inputs: TransferInput[] = [{ signer: privateKey }]
) {
  const tx = new btc.Transaction();
  inputs.forEach(({ signer, signedSats = prevoutSats }, index) =>
    tx.addInput({
      txid: hex.decode('cd'.repeat(32)),
      index,
      witnessUtxo: { script: btc.p2wpkh(pubECDSA(signer)).script, amount: signedSats },
    })
  );
  outputs.forEach(output => tx.addOutputAddress(output.address, output.amount));
  inputs.forEach(({ signer }, index) => tx.signIdx(signer, index));
  tx.finalize();
  return tx;
}

const transferParams = {
  recipients: [
    { address: otherAddress, amount: '800' },
    { address: otherAddress, amount: '900' },
  ],
};

const correctOutputs = [
  { address: otherAddress, amount: 800n },
  { address: otherAddress, amount: 900n },
  { address: ownAddress, amount: 8_000n },
];

const broadcastTransfer = verifyBtcTransfer({ broadcast: true, prevoutSats });

describe('verifyBtcTransfer', () => {
  test('accepts a broadcast transfer that pays the recipients and matches its txid', async () => {
    const tx = transfer(correctOutputs);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects a txid that is not the returned transaction', async () => {
    const tx = transfer(correctOutputs);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: 'ab'.repeat(32) },
    });
    expect(failedLabels(report)).toEqual(['txid is the id of the returned transaction']);
  });

  test('rejects a transfer to the wrong recipient', async () => {
    const tx = transfer([
      { address: ownAddress, amount: 800n },
      { address: otherAddress, amount: 900n },
      { address: ownAddress, amount: 8_000n },
    ]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(report.ok).toBe(false);
    expect(failedLabels(report)).toEqual([`pays 800 sats to ${otherAddress}`]);
  });

  test('rejects a transfer that pays the recipients to the change address', async () => {
    const tx = transfer([
      { address: ownAddress, amount: 800n },
      { address: ownAddress, amount: 900n },
      { address: ownAddress, amount: 8_000n },
    ]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toEqual([
      `pays 800 sats to ${otherAddress}`,
      `pays 900 sats to ${otherAddress}`,
    ]);
  });

  test('rejects change that does not go back to the wallet', async () => {
    const tx = transfer([
      { address: otherAddress, amount: 800n },
      { address: otherAddress, amount: 900n },
      { address: otherAddress, amount: 8_000n },
    ]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toEqual(['output 2 is change back to the wallet']);
  });

  test('rejects a wrong amount', async () => {
    const tx = transfer([
      { address: otherAddress, amount: 801n },
      { address: otherAddress, amount: 900n },
    ]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toContain(`pays 800 sats to ${otherAddress}`);
  });

  test('rejects an input signed by another key', async () => {
    const tx = transfer(correctOutputs, [{ signer: otherPrivateKey }]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toEqual([
      "input 0 is signed by the wallet's native-segwit key",
      `input 0 signature verifies for the wallet's ${prevoutSats} sat native-segwit prevout`,
    ]);
  });

  test('rejects a foreign input next to an own one', async () => {
    const tx = transfer(correctOutputs, [{ signer: privateKey }, { signer: otherPrivateKey }]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toEqual([
      "input 1 is signed by the wallet's native-segwit key",
      `input 1 signature verifies for the wallet's ${prevoutSats} sat native-segwit prevout`,
    ]);
  });

  test('rejects a signature over another prevout amount', async () => {
    const tx = transfer(correctOutputs, [{ signer: privateKey, signedSats: prevoutSats - 1n }]);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(failedLabels(report)).toEqual([
      `input 0 signature verifies for the wallet's ${prevoutSats} sat native-segwit prevout`,
    ]);
  });

  test('rejects a garbage signature with the right key', async () => {
    const tx = transfer(correctOutputs);
    const signed = tx.getInput(0).finalScriptWitness ?? [];
    const garbage = btc.Transaction.fromRaw(tx.toBytes(true, true), { allowUnknownOutputs: true });
    const [signature, key] = signed;
    if (!signature || !key) throw new Error('transfer is not signed');
    const flipped = Uint8Array.from(signature);
    flipped[10] = (flipped[10] ?? 0) ^ 1;
    garbage.updateInput(0, { finalScriptWitness: [flipped, key] }, true);
    const report = await broadcastTransfer({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: garbage.hex, txid: garbage.id },
    });
    expect(failedLabels(report)).toEqual([
      `input 0 signature verifies for the wallet's ${prevoutSats} sat native-segwit prevout`,
    ]);
  });

  test('rejects a sign-only answer that carries a txid', async () => {
    const tx = transfer(correctOutputs);
    const signOnly = verifyBtcTransfer({ broadcast: false, prevoutSats });
    const clean = await signOnly({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex },
    });
    const broadcast = await signOnly({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: tx.hex, txid: tx.id },
    });
    expect(clean.ok).toBe(true);
    expect(failedLabels(broadcast)).toEqual(['nothing was broadcast']);
  });

  test('rejects a missing transaction', async () => {
    const report = await verifyBtcTransfer({ broadcast: false, prevoutSats })({
      ctx: ownContext,
      params: transferParams,
      result: { transaction: 'zz' },
    });
    expect(failedLabels(report)).toEqual(['a signed transaction came back']);
  });
});

const proposer = {
  address: 'bc1qwfnhmwpth429l7xmgnej2gdx2frlpe8s28qc4c',
  message: '2e44a0213859a47c604f8e1bcf1e6110ee4868f4bc20cda25800ad77962372e1',
  signature:
    'AkcwRAIgRTAdNyEvAfMOaqH6zK6FLmGgu1Oj3fXbhOAyI+JCf5sCIDq0P71sF67OvpdQ5BDSPq9xji3anjrprzy7G7nrDV9QASECGh/fS9fdUtXmcsEj41k23vK36fX/RU0+P2WEBqCznB4=',
};
const otherSignerAddress = 'bc1q3gxpkrm4hnyvrf6x47vva2y64srpq8l220r79f';

describe('verifyBip322Signature', () => {
  const proposerContext = contextWith([
    { symbol: 'BTC', type: 'p2wpkh', address: proposer.address },
  ]);

  test('accepts a signature that verifies for the wallet address and message', async () => {
    const report = await verifyBip322Signature()({
      ctx: proposerContext,
      params: { message: proposer.message },
      result: { signature: proposer.signature, address: proposer.address },
    });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects a signature over another message', async () => {
    const report = await verifyBip322Signature()({
      ctx: proposerContext,
      params: { message: 'something else' },
      result: { signature: proposer.signature, address: proposer.address },
    });
    expect(failedLabels(report)).toEqual([
      'BIP-322 signature verifies for the address and message',
    ]);
  });

  test('rejects a signature claimed for another address', async () => {
    const report = await verifyBip322Signature()({
      ctx: contextWith([{ symbol: 'BTC', type: 'p2wpkh', address: otherSignerAddress }]),
      params: { message: proposer.message },
      result: { signature: proposer.signature, address: otherSignerAddress },
    });
    expect(failedLabels(report)).toEqual([
      'BIP-322 signature verifies for the address and message',
    ]);
  });

  test("rejects a valid signature from an address that is not the wallet's", async () => {
    const report = await verifyBip322Signature()({
      ctx: ownContext,
      params: { message: proposer.message },
      result: { signature: proposer.signature, address: proposer.address },
    });
    expect(failedLabels(report)).toEqual(["address is the wallet's native-segwit address"]);
  });
});

describe('verifyBtcAccountIndex', () => {
  test('rejects an address that does not belong to the returned key', async () => {
    const report = await verifyBtcAccountIndex(1)({
      ctx: ownContext,
      params: {},
      result: {
        addresses: [
          {
            symbol: 'BTC',
            type: 'p2wpkh',
            address: otherAddress,
            publicKey: hex.encode(publicKey),
            derivationPath: "m/84'/0'/1'/0/0",
          },
        ],
      },
    });
    expect(failedLabels(report)).toEqual(['p2wpkh address belongs to the returned public key']);
  });

  test('rejects a path at another account index', async () => {
    const report = await verifyBtcAccountIndex(1)({
      ctx: ownContext,
      params: {},
      result: {
        addresses: [
          {
            symbol: 'BTC',
            type: 'p2wpkh',
            address: ownAddress,
            publicKey: hex.encode(publicKey),
            derivationPath: "m/84'/0'/0'/0/0",
          },
        ],
      },
    });
    expect(failedLabels(report)).toEqual(['p2wpkh address is from account index 1']);
  });
});

describe('verifyAccountAddresses', () => {
  const taprootKey = pubSchnorr(privateKey);
  const stxPublicKey = hex.encode(publicKey);
  const account = [
    {
      symbol: 'BTC',
      type: 'p2wpkh',
      address: ownAddress,
      publicKey: hex.encode(publicKey),
      derivationPath: "m/84'/0'/0'/0/0",
    },
    {
      symbol: 'BTC',
      type: 'p2tr',
      address: btc.p2tr(taprootKey).address ?? '',
      publicKey: hex.encode(publicKey),
      derivationPath: "m/86'/0'/0'/0/0",
    },
    {
      symbol: 'STX',
      address: getAddressFromPublicKey(stxPublicKey, 'mainnet'),
      publicKey: stxPublicKey,
    },
  ];

  test('accepts account 0 addresses that belong to their keys', async () => {
    const report = await verifyAccountAddresses(0)({
      ctx: ownContext,
      params: {},
      result: { addresses: account },
    });
    expect(failedLabels(report)).toEqual([]);
  });

  test('rejects addresses from another account and keys that do not own them', async () => {
    const [nativeSegwit, taproot, stacks] = account;
    const report = await verifyAccountAddresses(0)({
      ctx: ownContext,
      params: {},
      result: {
        addresses: [
          { ...nativeSegwit, derivationPath: "m/84'/0'/1'/0/0" },
          { ...taproot, publicKey: hex.encode(otherPublicKey) },
          { ...stacks, publicKey: hex.encode(otherPublicKey) },
        ],
      },
    });
    expect(failedLabels(report)).toEqual([
      'p2wpkh address is from account index 0',
      'p2tr address belongs to the returned public key',
      'address belongs to the returned public key',
    ]);
  });
});
