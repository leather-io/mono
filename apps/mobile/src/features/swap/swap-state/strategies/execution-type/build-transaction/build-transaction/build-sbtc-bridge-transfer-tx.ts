import * as btc from '@scure/btc-signer';
import type { P2TROut } from '@scure/btc-signer/payment';
import { bytesToHex } from '@stacks/common';
import { STACKS_DEVNET } from '@stacks/network';
import { BufferCV, fetchCallReadOnlyFunction } from '@stacks/transactions';
import {
  DEFAULT_MAX_SIGNER_FEE,
  DEFAULT_RECLAIM_LOCK_TIME,
  MAINNET,
  REGTEST,
  type SbtcApiClient,
  SbtcApiClientMainnet,
  SbtcApiClientTestnet,
  TESTNET,
  buildSbtcDepositTx,
} from 'sbtc';

import { BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import {
  AccountAddresses,
  type BitcoinNetworkModes,
  type NetworkConfiguration,
} from '@leather.io/models';

const clientMainnet = new SbtcApiClientMainnet({});
const clientTestnet = new SbtcApiClientTestnet({});

export interface SbtcDeposit {
  address: string;
  depositScript: string;
  reclaimScript: string;
  transaction: btc.Transaction;
  trOut: P2TROut;
}

export async function buildSbtcBridgeTransferTx(
  amountSats: number | bigint,
  network: NetworkConfiguration,
  account: AccountAddresses,
  payer: BitcoinNativeSegwitPayer
): Promise<SbtcDeposit> {
  const client = network.chain.bitcoin.mode === 'mainnet' ? clientMainnet : clientTestnet;

  return buildSbtcDepositTx({
    amountSats,
    network: getSbtcNetworkConfig(network.chain.bitcoin.mode),
    stacksAddress: account.stacks?.stxAddress ?? '', // TODO: ???
    maxSignerFee: DEFAULT_MAX_SIGNER_FEE,
    reclaimLockTime: DEFAULT_RECLAIM_LOCK_TIME,
    reclaimPublicKey: bytesToHex(payer.publicKey).slice(2),
    signersPublicKey: await fetchSignersPublicKey({
      contractAddress: client.config.sbtcContract,
      client: client.config,
    }),
  });
}

function getSbtcNetworkConfig(network: BitcoinNetworkModes) {
  const networkMap = {
    mainnet: MAINNET,
    testnet: TESTNET,
    regtest: REGTEST,
    // Signet supported not tested, but likely uses same values as testnet
    signet: TESTNET,
  };
  return networkMap[network];
}

// Cloned from sbtc package because it doesn't support providing custom fetch
// function, which we need to avoid 429s by adding our header
// https://github.com/hirosystems/stacks.js/blob/36a2065368f9852b382c15a4e5e852d0c949845a/packages/sbtc/src/api.ts#L153-L164
// TODO: remove when sbtc supports custom fetch fn
async function fetchSignersPublicKey({
  contractAddress,
  client,
}: {
  contractAddress: string;
  client: SbtcApiClient['config'];
}): Promise<string> {
  const res = (await fetchCallReadOnlyFunction({
    contractAddress,
    contractName: 'sbtc-registry',
    functionName: 'get-current-aggregate-pubkey',
    functionArgs: [],
    senderAddress: STACKS_DEVNET.bootAddress, // zero address
    client: { baseUrl: client.stxApiUrl, fetch: hiroFetchWrapper },
  })) as BufferCV;

  return res.value.slice(2);
}

export async function hiroFetchWrapper(input: RequestInfo | URL, init?: RequestInit) {
  const url =
    typeof input === 'string' || input instanceof URL
      ? new URL(input.toString())
      : new URL(input.url);

  const headers = new Headers(
    init?.headers || (input instanceof Request ? input.headers : undefined)
  );

  // Supports hiro.so including subdomains
  if (url.hostname.endsWith('hiro.so')) headers.set('X-Partner', 'Leather');

  // Use the modified headers in the final init object
  const finalInit = { ...init, headers } as const;

  return fetch(input, finalInit);
}
