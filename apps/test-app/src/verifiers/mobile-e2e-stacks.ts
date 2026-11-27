import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, concatBytes, utf8ToBytes } from '@stacks/common';
import {
  PayloadType,
  type StacksTransactionWire,
  StacksWireType,
  deserializeCV,
  deserializeTransaction,
  encodeStructuredDataBytes,
  getAddressFromPublicKey,
  isSequentialMultiSig,
  isSingleSig,
  nextVerification,
  publicKeyFromSignatureRsv,
  serializeCV,
} from '@stacks/transactions';

import { isRecord, readString } from '../guards';
import { networkModeOf } from '../networks';
import {
  type RequestContext,
  type Verifier,
  type VerifyArgs,
  type VerifyCheck,
  networkOf,
} from '../types';
import { fetchStxAccount, isWalletAddress } from '../wallet';
import { decodeStxTransaction } from './stx-decode';

const stxMessagePrefix = '\x17Stacks Signed Message:\n';
const varintSingleByteLimit = 0xfd;
const stxDerivationPathPrefix = "m/44'/5757'/";

function report(checks: VerifyCheck[]) {
  return { ok: checks.length > 0 && checks.every(check => check.ok), checks };
}

export function hashUtf8Message(message: string) {
  const messageBytes = utf8ToBytes(message);
  if (messageBytes.length >= varintSingleByteLimit) throw new Error('Message too long');
  return bytesToHex(
    sha256(
      concatBytes(
        utf8ToBytes(stxMessagePrefix),
        new Uint8Array([messageBytes.length]),
        messageBytes
      )
    )
  );
}

export function hashStructuredMessage(message: string, domain: string) {
  return bytesToHex(
    sha256(
      encodeStructuredDataBytes({ message: deserializeCV(message), domain: deserializeCV(domain) })
    )
  );
}

function recoversTo(hash: string, signature: string, publicKey: string) {
  const vrs = signature.slice(-2) + signature.slice(0, -2);
  return [signature, vrs].some(candidate => {
    try {
      return publicKeyFromSignatureRsv(hash, candidate) === publicKey;
    } catch {
      return false;
    }
  });
}

async function accountPublicKey(ctx: RequestContext) {
  try {
    return (await fetchStxAccount(ctx)).publicKey;
  } catch {
    return undefined;
  }
}

function safeDeserialize(txHex: string) {
  try {
    return deserializeTransaction(txHex);
  } catch {
    return undefined;
  }
}

export function verifyMessageSignature(hashOf: (params: unknown) => string | undefined): Verifier {
  return async ({ ctx, params, result }) => {
    const signature = readString(result, 'signature');
    const publicKey = readString(result, 'publicKey');
    const hash = hashOf(params);
    const ownKey = await accountPublicKey(ctx);
    const checks: VerifyCheck[] = [
      { label: 'signature returned', ok: !!signature },
      {
        label: "publicKey is the account's STX key",
        ok: !!publicKey && publicKey === ownKey,
        detail: `got ${publicKey ?? 'none'}, account ${ownKey ?? 'unknown'}`,
      },
      { label: 'request carries a message', ok: !!hash },
    ];
    if (signature && publicKey && hash)
      checks.push({
        label: 'signature recovers to the returned publicKey',
        ok: recoversTo(hash, signature, publicKey),
      });
    return report(checks);
  };
}

function tokenTransferOf(tx: StacksTransactionWire) {
  return tx.payload.payloadType === PayloadType.TokenTransfer ? tx.payload : undefined;
}

function multisigOf(tx: StacksTransactionWire) {
  const condition = tx.auth.spendingCondition;
  return isSingleSig(condition) ? undefined : condition;
}

function recoveredMultisigSigners(tx: StacksTransactionWire): string[] | undefined {
  const condition = multisigOf(tx);
  if (!condition) return undefined;
  try {
    return condition.fields.reduce(
      (state, field) => {
        if (field.contents.type !== StacksWireType.MessageSignature) return state;
        const { pubKey, nextSigHash } = nextVerification(
          state.sigHash,
          tx.auth.authType,
          condition.fee,
          condition.nonce,
          field.pubKeyEncoding,
          field.contents.data
        );
        return {
          sigHash: isSequentialMultiSig(condition.hashMode) ? nextSigHash : state.sigHash,
          signers: [
            ...state.signers,
            typeof pubKey.data === 'string' ? pubKey.data : bytesToHex(pubKey.data),
          ],
        };
      },
      { sigHash: tx.signBegin(), signers: new Array<string>() }
    ).signers;
  } catch {
    return undefined;
  }
}

export function verifyMultisigSignature(): Verifier {
  return async ({ ctx, params, result }) => {
    const unsignedHex = readString(params, 'txHex');
    const signedHex = readString(result, 'txHex') ?? readString(result, 'transaction');
    const unsigned = unsignedHex ? safeDeserialize(unsignedHex) : undefined;
    const signed = signedHex ? safeDeserialize(signedHex) : undefined;
    if (!unsigned || !signed)
      return report([{ label: 'request and response carry a transaction', ok: false }]);
    const unsignedTransfer = tokenTransferOf(unsigned);
    const signedTransfer = tokenTransferOf(signed);
    const unsignedMultisig = multisigOf(unsigned);
    const signedMultisig = multisigOf(signed);
    const before = unsigned.auth.spendingCondition;
    const after = signed.auth.spendingCondition;
    const addedFields = signedMultisig?.fields ?? [];
    const signers = recoveredMultisigSigners(signed);
    const ownKey = await accountPublicKey(ctx);
    const checks: VerifyCheck[] = [
      { label: 'payload is still a token transfer', ok: !!signedTransfer },
      {
        label: 'recipient unchanged',
        ok:
          !!unsignedTransfer &&
          !!signedTransfer &&
          serializeCV(unsignedTransfer.recipient) === serializeCV(signedTransfer.recipient),
      },
      {
        label: 'amount unchanged',
        ok: !!signedTransfer && unsignedTransfer?.amount === signedTransfer.amount,
      },
      { label: 'nonce unchanged', ok: before.nonce === after.nonce },
      { label: 'fee unchanged', ok: before.fee === after.fee },
      { label: 'signer unchanged', ok: before.signer === after.signer },
      { label: 'hashMode unchanged', ok: before.hashMode === after.hashMode },
      {
        label: 'signaturesRequired unchanged',
        ok:
          !!signedMultisig &&
          unsignedMultisig?.signaturesRequired === signedMultisig.signaturesRequired,
      },
      {
        label: 'exactly one signature field added',
        ok:
          addedFields.length - (unsignedMultisig?.fields.length ?? 0) === 1 &&
          addedFields.some(field => field.contents.type === StacksWireType.MessageSignature),
        detail: `${addedFields.length} field(s)`,
      },
      {
        label: "the signature recovers over the sighash to the account's STX key",
        ok: !!ownKey && signers?.length === 1 && signers[0] === ownKey,
        detail: `recovered ${signers?.join(', ') || 'nothing'}, account ${ownKey ?? 'unknown'}`,
      },
    ];
    return report(checks);
  };
}

function readAmount(params: unknown) {
  if (!isRecord(params)) return undefined;
  const { amount } = params;
  if (typeof amount === 'number' || typeof amount === 'string' || typeof amount === 'bigint')
    return String(amount);
  return undefined;
}

function originVerifies(tx: StacksTransactionWire) {
  try {
    tx.verifyOrigin();
    return true;
  } catch {
    return false;
  }
}

function singleSigSigner(tx: StacksTransactionWire): string | undefined {
  const condition = tx.auth.spendingCondition;
  if (!isSingleSig(condition)) return undefined;
  try {
    const { pubKey } = nextVerification(
      tx.signBegin(),
      tx.auth.authType,
      condition.fee,
      condition.nonce,
      condition.keyEncoding,
      condition.signature.data
    );
    return typeof pubKey.data === 'string' ? pubKey.data : bytesToHex(pubKey.data);
  } catch {
    return undefined;
  }
}

function accountSignerCheck(tx: StacksTransactionWire | undefined, ownKey: string | undefined) {
  const signer = tx ? singleSigSigner(tx) : undefined;
  return {
    label: "the signature recovers over the sighash to the account's STX key",
    ok: !!ownKey && signer === ownKey,
    detail: `recovered ${signer ?? 'nothing'}, account ${ownKey ?? 'unknown'}`,
  };
}

export function verifyBroadcastTransfer(): Verifier {
  return async ({ ctx, params, result }) => {
    const txid = readString(result, 'txid');
    const transaction = readString(result, 'transaction');
    const tx = transaction ? safeDeserialize(transaction) : undefined;
    const decoded = transaction && tx ? decodeStxTransaction(transaction) : undefined;
    const payload = decoded?.payload.type === 'token-transfer' ? decoded.payload : undefined;
    const recipient = readString(params, 'recipient');
    const amount = readAmount(params);
    const memo = readString(params, 'memo') ?? '';
    return report([
      { label: 'txid returned', ok: !!txid },
      { label: 'transaction returned', ok: !!tx },
      {
        label: `recipient is ${recipient ?? 'the requested one'}`,
        ok: !!payload && !!recipient && payload.recipient === recipient,
        detail: payload?.recipient,
      },
      {
        label: `amount is ${amount ?? 'the requested one'}`,
        ok: !!payload && !!amount && payload.amount === amount,
        detail: payload?.amount,
      },
      {
        label: memo ? `memo is ${memo}` : 'memo is empty',
        ok: !!payload && payload.memo === memo,
        detail: payload?.memo,
      },
      {
        label: 'signature recovers to the transaction signer',
        ok: !!tx && originVerifies(tx),
      },
      accountSignerCheck(tx, await accountPublicKey(ctx)),
      {
        label: 'txid is the returned transaction',
        ok: !!tx && !!txid && tx.txid() === txid.replace(/^0x/, ''),
      },
    ]);
  };
}

export function verifySingleSigSignature(): Verifier {
  return async ({ ctx, params, result }) => {
    const unsignedHex = readString(params, 'transaction') ?? readString(params, 'txHex');
    const signedHex = readString(result, 'transaction') ?? readString(result, 'txHex');
    const unsigned = unsignedHex ? safeDeserialize(unsignedHex) : undefined;
    const signed = signedHex ? safeDeserialize(signedHex) : undefined;
    if (!unsigned || !signed)
      return report([{ label: 'request and response carry a transaction', ok: false }]);
    const unsignedTransfer = tokenTransferOf(unsigned);
    const signedTransfer = tokenTransferOf(signed);
    const before = unsigned.auth.spendingCondition;
    const after = signed.auth.spendingCondition;
    return report([
      { label: 'payload is still a token transfer', ok: !!signedTransfer },
      {
        label: 'recipient unchanged',
        ok:
          !!unsignedTransfer &&
          !!signedTransfer &&
          serializeCV(unsignedTransfer.recipient) === serializeCV(signedTransfer.recipient),
      },
      {
        label: 'amount unchanged',
        ok: !!signedTransfer && unsignedTransfer?.amount === signedTransfer.amount,
      },
      {
        label: 'memo unchanged',
        ok: !!signedTransfer && unsignedTransfer?.memo.content === signedTransfer.memo.content,
      },
      { label: 'nonce unchanged', ok: before.nonce === after.nonce },
      { label: 'signer unchanged', ok: before.signer === after.signer },
      { label: 'still single-sig', ok: isSingleSig(after) },
      { label: 'signature recovers to the transaction signer', ok: originVerifies(signed) },
      accountSignerCheck(signed, await accountPublicKey(ctx)),
    ]);
  };
}

interface StxAddressEntry {
  address: string;
  publicKey?: string;
  derivationPath?: string;
}

function stxEntriesIn(result: unknown): StxAddressEntry[] {
  if (Array.isArray(result))
    return result.filter(isRecord).flatMap(entry => {
      const address = readString(entry, 'address');
      return address
        ? [
            {
              address,
              publicKey: readString(entry, 'publicKey'),
              derivationPath: readString(entry, 'derivationPath'),
            },
          ]
        : [];
    });
  if (isRecord(result) && Array.isArray(result.addresses))
    return result.addresses
      .filter(isWalletAddress)
      .filter(entry => entry.symbol === 'STX')
      .map(entry => ({
        address: entry.address,
        publicKey: entry.publicKey,
        derivationPath: entry.derivationPath,
      }));
  return [];
}

function stxAddressOf(publicKey: string, mainnet: boolean) {
  try {
    return getAddressFromPublicKey(publicKey, mainnet ? 'mainnet' : 'testnet');
  } catch {
    return undefined;
  }
}

export function stxAddressChecks({ ctx, result }: VerifyArgs): VerifyCheck[] {
  const entries = stxEntriesIn(result);
  const [entry] = entries;
  const mainnet = networkModeOf(networkOf(ctx)) === 'mainnet';
  const prefix = mainnet ? 'SP' : 'ST';
  return [
    { label: 'exactly one STX address', ok: entries.length === 1, detail: `${entries.length}` },
    {
      label: `address starts with ${prefix}`,
      ok: !!entry && entry.address.startsWith(prefix),
      detail: entry?.address ?? 'none',
    },
    {
      label: 'address belongs to the returned public key',
      ok: !!entry?.publicKey && stxAddressOf(entry.publicKey, mainnet) === entry.address,
    },
  ];
}

export function verifyStxAddresses(accountIndex: number): Verifier {
  return args => {
    const path = stxEntriesIn(args.result).at(0)?.derivationPath;
    return report([
      ...stxAddressChecks(args),
      {
        label: `derivation path is a Stacks path at account index ${accountIndex}`,
        ok:
          !!path &&
          path.startsWith(stxDerivationPathPrefix) &&
          path.split('/').at(-1) === `${accountIndex}`,
        detail: path ?? 'no derivationPath',
      },
    ]);
  };
}
