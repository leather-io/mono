import { secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { sha256x2 } from '@scure/btc-signer/utils';

import {
  getBtcSignerLibNetworkConfigByMode,
  verifyP2wpkhBip322Signature,
} from '@leather.io/bitcoin';

import { isRecord, readString } from '../guards';
import { networkModeOf } from '../networks';
import { type RequestContext, type Verifier, type VerifyCheck, networkOf } from '../types';
import { type WalletAddress, fetchAddresses, isWalletAddress } from '../wallet';
import { stxAddressChecks } from './mobile-e2e-stacks';
import { checkSignature } from './psbt-signatures';

const defaultTaprootSighash = 0x00;
const taprootSignatureWithFlagLength = 65;

function report(checks: VerifyCheck[]) {
  return { ok: checks.length > 0 && checks.every(check => check.ok), checks };
}

function decodeBitcoinTransaction(txHex: string): btc.Transaction | undefined {
  try {
    const bytes = hex.decode(txHex);
    try {
      return btc.Transaction.fromPSBT(bytes, {
        allowUnknownInputs: true,
        allowUnknownOutputs: true,
      });
    } catch {
      return btc.Transaction.fromRaw(bytes, { allowUnknownOutputs: true });
    }
  } catch {
    return undefined;
  }
}

export function txidOf(tx: btc.Transaction) {
  return hex.encode(sha256x2(tx.toBytes(true, false)).reverse());
}

interface WitnessSignature {
  signature: Uint8Array;
  pubkey?: Uint8Array;
}

function signatureOn(tx: btc.Transaction, index: number): WitnessSignature | undefined {
  const input = tx.getInput(index);
  const witness = input.finalScriptWitness;
  if (witness && witness.length === 2) return { signature: witness[0], pubkey: witness[1] };
  if (witness && witness.length === 1) return { signature: witness[0] };
  const [partial] = input.partialSig ?? [];
  if (partial) return { pubkey: partial[0], signature: partial[1] };
  if (input.tapKeySig) return { signature: input.tapKeySig };
  return undefined;
}

function inputSignatureCheck(
  requested: btc.Transaction,
  signed: btc.Transaction,
  index: number
): VerifyCheck {
  const label = `input ${index} carries a valid signature for the requested transaction`;
  const found = signatureOn(signed, index);
  if (!found) return { label, ok: false, detail: 'no signature or witness' };
  const script = requested.getInput(index).witnessUtxo?.script;
  if (!script) return { label, ok: false, detail: 'requested input has no witnessUtxo' };
  const lock = btc.OutScript.decode(script);
  if (lock.type === 'wpkh') {
    if (!found.pubkey) return { label, ok: false, detail: 'witness carries no public key' };
    if (hex.encode(btc.p2wpkh(found.pubkey).script) !== hex.encode(script))
      return { label, ok: false, detail: 'witness key does not own the input' };
    const ok = checkSignature(requested, {
      index,
      kind: 'ecdsa',
      pubkey: found.pubkey,
      signature: found.signature,
      sighash: found.signature[found.signature.length - 1],
      finalized: true,
    });
    return { label, ok, detail: ok ? undefined : 'ECDSA signature does not verify' };
  }
  if (lock.type === 'tr') {
    const ok = checkSignature(requested, {
      index,
      kind: 'schnorr',
      pubkey: lock.pubkey,
      signature: found.signature,
      sighash:
        found.signature.length === taprootSignatureWithFlagLength
          ? found.signature[taprootSignatureWithFlagLength - 1]
          : defaultTaprootSighash,
      finalized: true,
    });
    return { label, ok, detail: ok ? undefined : 'Schnorr signature does not verify' };
  }
  return { label, ok: false, detail: `unsupported input type ${lock.type}` };
}

export function verifyBroadcastPsbt(): Verifier {
  return ({ params, result }) => {
    const requestedHex = readString(params, 'hex');
    const requested = requestedHex ? decodeBitcoinTransaction(requestedHex) : undefined;
    if (!requested)
      return report([{ label: 'request carries a PSBT', ok: false, detail: 'no `hex` param' }]);
    const txid = readString(result, 'txid');
    const signedHex = readString(result, 'hex');
    const signed = signedHex ? decodeBitcoinTransaction(signedHex) : undefined;
    const checks: VerifyCheck[] = [
      {
        label: 'txid is the id of the requested transaction',
        ok: txid === txidOf(requested),
        detail: `got ${txid ?? 'none'}, expected ${txidOf(requested)}`,
      },
      {
        label: 'returned transaction is the requested one',
        ok: !!signed && txidOf(signed) === txidOf(requested),
        detail: signed ? txidOf(signed) : 'no decodable `hex` in the response',
      },
    ];
    if (signed)
      Array.from({ length: requested.inputsLength }, (_, index) => index).forEach(index =>
        checks.push(inputSignatureCheck(requested, signed, index))
      );
    return report(checks);
  };
}

interface RequestedRecipient {
  address: string;
  amount: bigint;
}

function requestedRecipients(params: unknown): RequestedRecipient[] | undefined {
  if (!isRecord(params) || !Array.isArray(params.recipients)) return undefined;
  const recipients = params.recipients.flatMap(recipient => {
    const address = readString(recipient, 'address');
    const amount = readString(recipient, 'amount');
    return address && amount && /^\d+$/.test(amount) ? [{ address, amount: BigInt(amount) }] : [];
  });
  return recipients.length === params.recipients.length ? recipients : undefined;
}

function outputScriptFor(address: string, ctx: RequestContext): string | undefined {
  try {
    const network = getBtcSignerLibNetworkConfigByMode(networkModeOf(networkOf(ctx)));
    return hex.encode(btc.OutScript.encode(btc.Address(network).decode(address)));
  } catch {
    return undefined;
  }
}

async function ownNativeSegwit(ctx: RequestContext): Promise<WalletAddress | undefined> {
  try {
    const addresses = await fetchAddresses(ctx, { allowPolicyAccounts: false });
    return addresses.find(entry => entry.symbol === 'BTC' && entry.type === 'p2wpkh');
  } catch {
    return undefined;
  }
}

function ownInputSignatureCheck(
  tx: btc.Transaction,
  index: number,
  ownScript: string | undefined,
  prevoutSats: bigint
): VerifyCheck {
  const label = `input ${index} signature verifies for the wallet's ${prevoutSats} sat native-segwit prevout`;
  const found = signatureOn(tx, index);
  if (!found?.pubkey || found.signature.length === 0)
    return { label, ok: false, detail: 'no witness signature and key' };
  if (!ownScript || hex.encode(btc.p2wpkh(found.pubkey).script) !== ownScript)
    return { label, ok: false, detail: 'witness key does not own the prevout' };
  try {
    const sighash = found.signature[found.signature.length - 1];
    const digest = tx.preimageWitnessV0(
      index,
      btc.p2pkh(found.pubkey).script,
      sighash,
      prevoutSats
    );
    const ok = secp256k1.verify(
      secp256k1.Signature.fromDER(found.signature.slice(0, -1)),
      digest,
      found.pubkey
    );
    return { label, ok, detail: ok ? undefined : 'ECDSA signature does not verify' };
  } catch {
    return { label, ok: false, detail: 'signature does not decode' };
  }
}

interface TransferExpectations {
  broadcast: boolean;
  prevoutSats: bigint;
}

export function verifyBtcTransfer({ broadcast, prevoutSats }: TransferExpectations): Verifier {
  return async ({ ctx, params, result }) => {
    const transaction = readString(result, 'transaction');
    const txid = readString(result, 'txid');
    const tx = transaction ? decodeBitcoinTransaction(transaction) : undefined;
    const recipients = requestedRecipients(params);
    const own = await ownNativeSegwit(ctx);
    if (!tx || !recipients || !own?.publicKey)
      return report([
        { label: 'a signed transaction came back', ok: !!tx },
        { label: 'request carries recipients', ok: !!recipients },
        { label: "wallet's native-segwit key is known", ok: !!own?.publicKey },
      ]);
    const ownPublicKey = own.publicKey;

    const outputs = Array.from({ length: tx.outputsLength }, (_, index) => tx.getOutput(index));
    const used = new Set<number>();
    const checks: VerifyCheck[] = recipients.map(recipient => {
      const script = outputScriptFor(recipient.address, ctx);
      const index = outputs.findIndex(
        (output, outputIndex) =>
          !used.has(outputIndex) &&
          !!output.script &&
          hex.encode(output.script) === script &&
          output.amount === recipient.amount
      );
      if (index >= 0) used.add(index);
      return {
        label: `pays ${recipient.amount} sats to ${recipient.address}`,
        ok: index >= 0,
      };
    });

    const ownScript = outputScriptFor(own.address, ctx);
    outputs.forEach((output, index) => {
      if (used.has(index)) return;
      checks.push({
        label: `output ${index} is change back to the wallet`,
        ok: !!output.script && hex.encode(output.script) === ownScript,
        detail: `${output.amount ?? 0n} sats`,
      });
    });

    checks.push({ label: 'spends at least one input', ok: tx.inputsLength > 0 });
    Array.from({ length: tx.inputsLength }, (_, index) => index).forEach(index => {
      const found = signatureOn(tx, index);
      checks.push({
        label: `input ${index} is signed by the wallet's native-segwit key`,
        ok:
          !!found?.pubkey &&
          found.signature.length > 0 &&
          hex.encode(found.pubkey) === ownPublicKey,
        detail: found?.pubkey ? hex.encode(found.pubkey) : 'no witness key',
      });
      checks.push(ownInputSignatureCheck(tx, index, ownScript, prevoutSats));
    });

    if (broadcast)
      checks.push({
        label: 'txid is the id of the returned transaction',
        ok: txid === txidOf(tx),
        detail: `got ${txid ?? 'none'}, transaction ${txidOf(tx)}`,
      });
    else
      checks.push({
        label: 'nothing was broadcast',
        ok: txid === undefined,
        detail: txid ? `txid ${txid}` : undefined,
      });
    return report(checks);
  };
}

export function verifyBip322Signature(): Verifier {
  return async ({ ctx, params, result }) => {
    const message = readString(params, 'message');
    const signature = readString(result, 'signature');
    const address = readString(result, 'address');
    const returnedMessage = readString(result, 'message');
    const own = await ownNativeSegwit(ctx);
    const checks: VerifyCheck[] = [
      { label: 'signature returned', ok: !!signature },
      {
        label: "address is the wallet's native-segwit address",
        ok: !!address && address === own?.address,
        detail: address ?? 'no address',
      },
      {
        label: 'returned message is the requested one',
        ok: returnedMessage === undefined || returnedMessage === message,
      },
    ];
    if (signature && address && message !== undefined)
      checks.push({
        label: 'BIP-322 signature verifies for the address and message',
        ok: verifyP2wpkhBip322Signature(address, message, signature),
      });
    return report(checks);
  };
}

function btcAddressesIn(result: unknown): WalletAddress[] {
  if (!isRecord(result) || !Array.isArray(result.addresses)) return [];
  return result.addresses.filter(isWalletAddress).filter(entry => entry.symbol === 'BTC');
}

function p2wpkhAddressOf(publicKey: string, ctx: RequestContext): string | undefined {
  try {
    const network = getBtcSignerLibNetworkConfigByMode(networkModeOf(networkOf(ctx)));
    return btc.p2wpkh(hex.decode(publicKey), network).address;
  } catch {
    return undefined;
  }
}

export function verifyBtcAccountIndex(accountIndex: number): Verifier {
  return ({ ctx, result }) => {
    const entry = btcAddressesIn(result).find(address => address.type === 'p2wpkh');
    const segment = entry?.derivationPath?.split('/')[3];
    return report([
      {
        label: `p2wpkh address is from account index ${accountIndex}`,
        ok: segment === `${accountIndex}'` || segment === `${accountIndex}h`,
        detail: entry?.derivationPath ?? 'no derivationPath',
      },
      {
        label: 'p2wpkh address belongs to the returned public key',
        ok: !!entry?.publicKey && p2wpkhAddressOf(entry.publicKey, ctx) === entry.address,
        detail: entry?.address ?? 'no p2wpkh address',
      },
    ]);
  };
}

const xOnlyKeyHexLength = 64;

function p2trAddressOf(publicKey: string, ctx: RequestContext): string | undefined {
  try {
    const network = getBtcSignerLibNetworkConfigByMode(networkModeOf(networkOf(ctx)));
    return btc.p2tr(hex.decode(publicKey.slice(-xOnlyKeyHexLength)), undefined, network).address;
  } catch {
    return undefined;
  }
}

function isAccountPath(path: string | undefined, accountIndex: number) {
  const segment = path?.split('/')[3];
  return segment === `${accountIndex}'` || segment === `${accountIndex}h`;
}

function verifyTaprootAccount(accountIndex: number): Verifier {
  return ({ ctx, result }) => {
    const entry = btcAddressesIn(result).find(address => address.type === 'p2tr');
    return report([
      {
        label: `p2tr address is from account index ${accountIndex}`,
        ok: isAccountPath(entry?.derivationPath, accountIndex),
        detail: entry?.derivationPath ?? 'no derivationPath',
      },
      {
        label: 'p2tr address belongs to the returned public key',
        ok: !!entry?.publicKey && p2trAddressOf(entry.publicKey, ctx) === entry.address,
        detail: entry?.address ?? 'no p2tr address',
      },
    ]);
  };
}

export function verifyAccountAddresses(accountIndex: number): Verifier {
  return async args => {
    const reports = await Promise.all(
      [verifyBtcAccountIndex(accountIndex), verifyTaprootAccount(accountIndex)].map(verify =>
        Promise.resolve(verify(args))
      )
    );
    return report([...reports.flatMap(({ checks }) => checks), ...stxAddressChecks(args)]);
  };
}

export function verifyBtcPrefixes(prefixes: { p2wpkh: string; p2tr: string }): Verifier {
  return ({ result }) => {
    const entries = btcAddressesIn(result);
    const nativeSegwit = entries.filter(entry => entry.type === 'p2wpkh');
    const taproot = entries.filter(entry => entry.type === 'p2tr');
    return report([
      {
        label: `p2wpkh addresses start with ${prefixes.p2wpkh}`,
        ok:
          nativeSegwit.length > 0 &&
          nativeSegwit.every(entry => entry.address.startsWith(prefixes.p2wpkh)),
        detail: nativeSegwit.map(entry => entry.address).join(', ') || 'none',
      },
      {
        label: `p2tr addresses start with ${prefixes.p2tr}`,
        ok: taproot.length > 0 && taproot.every(entry => entry.address.startsWith(prefixes.p2tr)),
        detail: taproot.map(entry => entry.address).join(', ') || 'none',
      },
    ]);
  };
}
