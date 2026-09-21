// Decodes the serialized Stacks transaction a wallet returns, so a spec can
// assert on what was actually signed: the sender, the nonce and fee the wallet
// filled in, the post-condition MODE, and every post condition that survived
// the round trip. Staking calls live or die by those last two.
//
// Pure: no React, no `window`.
import { hexToBytes } from '@stacks/common';
import {
  BytesReader,
  PayloadType,
  type PostCondition,
  StacksWireType,
  addressHashModeToVersion,
  addressToString,
  cvToString,
  deserializePostConditionWire,
  deserializeTransaction,
  wireToPostCondition,
} from '@stacks/transactions';

export interface DecodedStxTransaction {
  version: number;
  chainId: number;
  /** Address derived from the transaction's own spending condition. */
  sender: string;
  nonce: string;
  fee: string;
  postConditionMode: 'allow' | 'deny' | 'originator' | 'unknown';
  postConditions: PostCondition[];
  payload: DecodedStxPayload;
  /** True once the spending condition carries a signature. */
  signed: boolean;
}

export type DecodedStxPayload =
  | { type: 'token-transfer'; recipient: string; amount: string; memo: string }
  | { type: 'contract-call'; contract: string; functionName: string; functionArgs: string[] }
  | { type: 'smart-contract'; name: string }
  | { type: 'other'; payloadType: number };

// The wire encoding is a byte; `originator` is the epoch-4.0 addition the
// staking calls use, so the names must cover all three.
const postConditionModeNames: Record<number, DecodedStxTransaction['postConditionMode']> = {
  0x01: 'allow',
  0x02: 'deny',
  0x03: 'originator',
};

const emptySignature = '00'.repeat(65);

/** Transaction version byte for mainnet; testnet is 0x80. */
const mainnetTransactionVersion = 0x00;

function decodePayload(
  payload: ReturnType<typeof deserializeTransaction>['payload']
): DecodedStxPayload {
  switch (payload.payloadType) {
    case PayloadType.TokenTransfer:
      return {
        type: 'token-transfer',
        recipient: cvToString(payload.recipient),
        amount: payload.amount.toString(),
        memo: payload.memo.content,
      };
    case PayloadType.ContractCall:
      return {
        type: 'contract-call',
        contract: `${addressToString(payload.contractAddress)}.${payload.contractName.content}`,
        functionName: payload.functionName.content,
        functionArgs: payload.functionArgs.map(argument => cvToString(argument)),
      };
    case PayloadType.SmartContract:
      return { type: 'smart-contract', name: payload.contractName.content };
    default:
      return { type: 'other', payloadType: payload.payloadType };
  }
}

type SpendingCondition = ReturnType<typeof deserializeTransaction>['auth']['spendingCondition'];

// The transaction carries the signer's hash160 and its hash mode, not an
// address: the c32 version byte comes from the hash mode (single-sig vs
// multisig) and the transaction's own network version.
function senderAddress(condition: SpendingCondition, transactionVersion: number): string {
  const network = transactionVersion === mainnetTransactionVersion ? 'mainnet' : 'testnet';
  return addressToString({
    type: StacksWireType.Address,
    version: addressHashModeToVersion(condition.hashMode, network),
    hash160: condition.signer,
  });
}

export function decodeStxTransaction(txHex: string): DecodedStxTransaction {
  const tx = deserializeTransaction(txHex);
  const condition = tx.auth.spendingCondition;
  const signature =
    'signature' in condition && condition.signature ? condition.signature.data : undefined;

  return {
    version: tx.transactionVersion,
    chainId: tx.chainId,
    sender: senderAddress(condition, tx.transactionVersion),
    nonce: condition.nonce.toString(),
    fee: condition.fee.toString(),
    postConditionMode: postConditionModeNames[tx.postConditionMode] ?? 'unknown',
    postConditions: tx.postConditions.values.map(wire => wireToPostCondition(wire)),
    payload: decodePayload(tx.payload),
    signed: signature !== undefined && signature !== emptySignature,
  };
}

/** Decode a single hex-serialized post condition, as sent in `postConditions`. */
export function decodePostCondition(postConditionHex: string): PostCondition {
  return wireToPostCondition(
    deserializePostConditionWire(new BytesReader(hexToBytes(postConditionHex)))
  );
}
