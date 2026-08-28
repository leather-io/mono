// Stacks requests (SIP-30 `stx_*` methods): transfers, contract calls,
// deploys, message + transaction signing.
//
// Entries that must name the sender — the SIP-10 `transfer` call and the
// pre-built unsigned transaction — read the CONNECTED wallet's STX address and
// public key first (one getAddresses prompt), so they are valid for whoever is
// signing.
import { Cl, makeUnsignedSTXTokenTransfer, serializeCV } from '@stacks/transactions';

import {
  SIP9_ASSET,
  SIP9_ASSET_ID,
  SIP10_ASSET,
  SIP10_CONTRACT,
  STX_RECIPIENT,
  TEST_MESSAGE,
} from '../constants';
import type { ParamsOf, RpcMethodSpec } from '../types';
import { fetchStxAccount } from '../wallet';

// Clarity values are passed to the wallet hex-serialized: build with `Cl.*`
// then `serializeCV`. This is a SIP-10 `transfer` argument list:
// (transfer (amount uint) (sender principal) (recipient principal) (memo (optional buff)))
// `sender` must be tx-sender, i.e. the connected wallet's own address.
function sip10TransferArgs(sender: string): string[] {
  return [
    Cl.uint(1_000_000),
    Cl.standardPrincipal(sender),
    Cl.standardPrincipal(STX_RECIPIENT),
    Cl.none(),
  ].map(serializeCV);
}

// SIP-018 structured data: domain + message, both hex-encoded Clarity tuples.
const structuredDomain = serializeCV(
  Cl.tuple({
    name: Cl.stringAscii('leather.io'),
    version: Cl.stringAscii('1.0.0'),
    'chain-id': Cl.uint(1), // 1 = mainnet
  })
);
const structuredMessage = serializeCV(
  Cl.tuple({
    structure: Cl.stringUtf8(TEST_MESSAGE),
    nonce: Cl.uint(42),
  })
);

// A tiny, valid Clarity contract for `stx_deployContract`.
const helloWorldContract = `(define-public (hello-world)
  (ok "Hello, world!"))`;

// Build an unsigned mainnet STX token transfer from `publicKey` (the connected
// wallet's, so its signature is the one the auth field expects) and return its
// serialized hex. Fee + nonce are supplied so no network fetch happens (both
// are baked into the serialized transaction).
async function buildUnsignedStxTransferHex(publicKey: string): Promise<string> {
  const tx = await makeUnsignedSTXTokenTransfer({
    recipient: STX_RECIPIENT,
    amount: 1_000_000n,
    fee: 300n,
    nonce: 0n,
    memo: 'Leather RPC test',
    publicKey,
    network: 'mainnet',
  });
  return tx.serialize();
}

export const stacksMethods: RpcMethodSpec[] = [
  {
    id: 'stx_getAddresses',
    method: 'stx_getAddresses',
    label: 'stx_getAddresses',
    category: 'Stacks',
    description: 'Prompts the user to share their STX mainnet addresses (SIP-30).',
    params: { network: 'mainnet' } satisfies ParamsOf<'stx_getAddresses'>,
  },

  // ── Transfers ─────────────────────────────────────────────────────────────
  {
    id: 'stx_transferStx',
    method: 'stx_transferStx',
    label: 'stx_transferStx',
    category: 'Stacks',
    description:
      'Transfer 1 STX (1,000,000 µSTX) on mainnet to STX_RECIPIENT (override with VITE_TEST_APP_STX_RECIPIENT). Approving on a funded wallet broadcasts a real transaction.',
    params: {
      recipient: STX_RECIPIENT,
      amount: 1_000_000,
      memo: 'Leather RPC test',
      network: 'mainnet',
    } satisfies ParamsOf<'stx_transferStx'>,
  },
  {
    id: 'stx_transferSip10Ft',
    method: 'stx_transferSip10Ft',
    label: 'stx_transferSip10Ft',
    category: 'Stacks',
    description:
      'Transfer a SIP-10 fungible token on mainnet (default LEO — set VITE_TEST_APP_SIP10_ASSET to one you hold).',
    params: {
      recipient: STX_RECIPIENT,
      asset: SIP10_ASSET,
      amount: 100,
      network: 'mainnet',
    } satisfies ParamsOf<'stx_transferSip10Ft'>,
  },
  {
    id: 'stx_transferSip9Nft',
    method: 'stx_transferSip9Nft',
    label: 'stx_transferSip9Nft',
    category: 'Stacks',
    description:
      'Transfer a SIP-9 NFT on mainnet (default Living Leather #647 — set VITE_TEST_APP_SIP9_ASSET + _ID to one you own).',
    params: {
      recipient: STX_RECIPIENT,
      asset: SIP9_ASSET,
      assetId: serializeCV(Cl.uint(SIP9_ASSET_ID)),
      network: 'mainnet',
    } satisfies ParamsOf<'stx_transferSip9Nft'>,
  },

  // ── Contracts ─────────────────────────────────────────────────────────────
  {
    id: 'stx_callContract',
    method: 'stx_callContract',
    label: 'stx_callContract',
    category: 'Stacks',
    description:
      'Call `transfer` on the SIP-10 contract behind SIP10_ASSET with YOUR address as sender (getAddresses prompt) — the contract asserts sender = tx-sender.',
    async params(ctx) {
      const { address } = await fetchStxAccount(ctx);
      return {
        contract: SIP10_CONTRACT,
        functionName: 'transfer',
        functionArgs: sip10TransferArgs(address),
        network: 'mainnet',
      } satisfies ParamsOf<'stx_callContract'>;
    },
  },
  {
    id: 'stx_deployContract',
    method: 'stx_deployContract',
    label: 'stx_deployContract',
    category: 'Stacks',
    description: 'Deploy a tiny hello-world contract on the private network.',
    params: {
      name: 'leather-rpc-hello-world',
      clarityCode: helloWorldContract,
      network: 'private',
    } satisfies ParamsOf<'stx_deployContract'>,
  },

  // ── Signing ───────────────────────────────────────────────────────────────
  {
    id: 'stx_signMessage-utf8',
    method: 'stx_signMessage',
    label: 'stx_signMessage (utf8)',
    category: 'Stacks',
    description: 'Sign a plain UTF-8 message with the STX key.',
    params: {
      messageType: 'utf8',
      message: TEST_MESSAGE,
      network: 'mainnet',
    } satisfies ParamsOf<'stx_signMessage'>,
  },
  {
    id: 'stx_signMessage-structured',
    method: 'stx_signMessage',
    label: 'stx_signMessage (structured)',
    category: 'Stacks',
    description: 'Sign SIP-018 structured data (hex-encoded Clarity values).',
    params: {
      messageType: 'structured',
      domain: structuredDomain,
      message: structuredMessage,
      network: 'mainnet',
    } satisfies ParamsOf<'stx_signMessage'>,
  },
  {
    id: 'stx_signStructuredMessage',
    method: 'stx_signStructuredMessage',
    label: 'stx_signStructuredMessage',
    category: 'Stacks',
    description: 'Legacy structured-data signing (domain + message as hex CVs).',
    params: {
      domain: structuredDomain,
      message: structuredMessage,
    } satisfies ParamsOf<'stx_signStructuredMessage'>,
  },
  {
    id: 'stx_signTransaction-sip30',
    method: 'stx_signTransaction',
    label: 'stx_signTransaction (SIP-30)',
    category: 'Stacks',
    description:
      'Reads your STX public key (getAddresses prompt), builds an unsigned STX transfer from it and asks to sign it (SIP-30 `transaction`).',
    async params(ctx) {
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        transaction: await buildUnsignedStxTransferHex(publicKey),
        network: 'mainnet',
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
  },
  {
    id: 'stx_signTransaction-legacy',
    method: 'stx_signTransaction',
    label: 'stx_signTransaction (legacy txHex)',
    category: 'Stacks',
    description: 'Same unsigned transfer built from your key, sent as the legacy `txHex` param.',
    async params(ctx) {
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        txHex: await buildUnsignedStxTransferHex(publicKey),
        network: 'mainnet',
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
  },
];
