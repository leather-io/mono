// Unsigned Stacks transactions for `stx_signTransaction`.
//
// Built from the CONNECTED wallet's public key, so the auth field names the
// account that will sign it — a transaction built for a foreign signer gets a
// signature the network rejects, which is a green approval screen hiding a
// dead transaction.
//
// Pure: no React, no `window`.
import {
  type ClarityValue,
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
  uintCV,
} from '@stacks/transactions';

import type { NetworkMode } from '../types';

/** Fee + nonce are supplied so building never touches the network. */
const fixedFee = 300n;
const fixedNonce = 0n;

/** The chain flavour @stacks/transactions expects for our network modes. */
export function stacksNetworkFor(mode: NetworkMode): 'mainnet' | 'testnet' | 'devnet' {
  if (mode === 'mainnet') return 'mainnet';
  return mode === 'testnet' ? 'testnet' : 'devnet';
}

export interface UnsignedStxTransferArgs {
  publicKey: string;
  recipient: string;
  mode: NetworkMode;
  amount?: bigint;
  memo?: string;
}

export async function buildUnsignedStxTransferHex({
  publicKey,
  recipient,
  mode,
  amount = 1_000_000n,
  memo = 'Leather RPC test',
}: UnsignedStxTransferArgs): Promise<string> {
  const tx = await makeUnsignedSTXTokenTransfer({
    recipient,
    amount,
    fee: fixedFee,
    nonce: fixedNonce,
    memo,
    publicKey,
    network: stacksNetworkFor(mode),
  });
  return tx.serialize();
}

export interface UnsignedMultisigStxTransferArgs {
  /** ORDERED signer keys; order defines the multisig address. */
  publicKeys: string[];
  numSignatures: number;
  recipient: string;
  mode: NetworkMode;
  amount?: bigint;
  memo?: string;
}

/**
 * An unsigned MULTISIG transfer — what a co-signer is handed in the Stacks
 * half of a vault. The wallet must add its own signature to the existing
 * spending condition rather than replace it.
 */
export async function buildUnsignedMultisigStxTransferHex({
  publicKeys,
  numSignatures,
  recipient,
  mode,
  amount = 1_000_000n,
  memo = 'Leather RPC test',
}: UnsignedMultisigStxTransferArgs): Promise<string> {
  const tx = await makeUnsignedSTXTokenTransfer({
    recipient,
    amount,
    fee: fixedFee,
    nonce: fixedNonce,
    memo,
    publicKeys,
    numSignatures,
    network: stacksNetworkFor(mode),
  });
  return tx.serialize();
}

export interface UnsignedContractCallArgs {
  publicKey: string;
  contract: string;
  functionName: string;
  functionArgs?: ClarityValue[];
  mode: NetworkMode;
}

/**
 * An unsigned CONTRACT CALL — the transaction shape `stx_signTransaction` sees
 * most often in the wild, and the one whose approval screen has to decode a
 * payload rather than an amount.
 */
export async function buildUnsignedContractCallHex({
  publicKey,
  contract,
  functionName,
  functionArgs = [uintCV(1)],
  mode,
}: UnsignedContractCallArgs): Promise<string> {
  const [contractAddress, contractName] = contract.split('.');
  if (!contractAddress || !contractName) throw new Error(`Invalid contract id: ${contract}`);
  const tx = await makeUnsignedContractCall({
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    fee: fixedFee,
    nonce: fixedNonce,
    publicKey,
    network: stacksNetworkFor(mode),
  });
  return tx.serialize();
}
