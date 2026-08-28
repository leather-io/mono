// Stacks requests (SIP-30 `stx_*` methods): transfers, contract calls,
// deploys, message + transaction signing.
//
// Entries that must name the sender — the SIP-10 `transfer` call and the
// pre-built unsigned transactions — read the CONNECTED wallet's STX address
// and public key first (one getAddresses prompt), so they are valid for
// whoever ends up signing.
import { Cl, serializeCV } from '@stacks/transactions';

import { buildUnsignedContractCallHex, buildUnsignedStxTransferHex } from '../builders/stx-tx';
import {
  SIP9_ASSET,
  SIP9_ASSET_ID,
  SIP10_ASSET,
  SIP10_CONTRACT,
  STX_RECIPIENT,
  TEST_MESSAGE,
} from '../constants';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyStxTransaction } from '../verifiers/spec-verifiers';
import { fetchStxAccount } from '../wallet';

// SIP-018 structured data: domain + message, both hex-encoded Clarity tuples.
// The chain id has to match the network being signed on, or the signature is
// valid for a domain the verifier will not accept.
function structuredDomain(chainId: number): string {
  return serializeCV(
    Cl.tuple({
      name: Cl.stringAscii('leather.io'),
      version: Cl.stringAscii('1.0.0'),
      'chain-id': Cl.uint(chainId),
    })
  );
}

const mainnetChainId = 1;
const testnetChainId = 2147483648;

const structuredMessage = serializeCV(
  Cl.tuple({
    structure: Cl.stringUtf8(TEST_MESSAGE),
    nonce: Cl.uint(42),
  })
);

// A tiny, valid Clarity contract for `stx_deployContract`.
const helloWorldContract = `(define-public (hello-world)
  (ok "Hello, world!"))`;

function chainIdFor(network: string): number {
  return networkModeOf(network) === 'mainnet' ? mainnetChainId : testnetChainId;
}

export const stacksMethods: RpcMethodSpec[] = [
  {
    id: 'stx_getAddresses',
    method: 'stx_getAddresses',
    label: 'stx_getAddresses',
    category: 'Stacks',
    description: 'Prompts the user to share their STX addresses (SIP-30).',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'stx_getAddresses'>;
    },
    expect: 'success',
    tags: ['ci'],
  },

  // ── Transfers ─────────────────────────────────────────────────────────────
  {
    id: 'stx_transferStx',
    method: 'stx_transferStx',
    label: 'stx_transferStx',
    category: 'Stacks',
    description:
      'Transfer 1 STX (1,000,000 µSTX) to STX_RECIPIENT (override with VITE_TEST_APP_STX_RECIPIENT). Stacks rejects a transfer to yourself, so this one cannot be a self-send.',
    params(ctx) {
      return {
        recipient: STX_RECIPIENT,
        amount: 1_000_000,
        memo: 'Leather RPC test',
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_transferStx'>;
    },
    expect: 'manual',
    tags: ['funds'],
  },
  {
    id: 'stx_transferSip10Ft',
    method: 'stx_transferSip10Ft',
    label: 'stx_transferSip10Ft',
    category: 'Stacks',
    description:
      'Transfer a SIP-10 fungible token (default LEO — set VITE_TEST_APP_SIP10_ASSET to one you hold).',
    params(ctx) {
      return {
        recipient: STX_RECIPIENT,
        asset: SIP10_ASSET,
        amount: 100,
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_transferSip10Ft'>;
    },
    expect: 'manual',
    tags: ['funds'],
  },
  {
    id: 'stx_transferSip9Nft',
    method: 'stx_transferSip9Nft',
    label: 'stx_transferSip9Nft',
    category: 'Stacks',
    description:
      'Transfer a SIP-9 NFT (default Living Leather #647 — set VITE_TEST_APP_SIP9_ASSET + _ID to one you own).',
    params(ctx) {
      return {
        recipient: STX_RECIPIENT,
        asset: SIP9_ASSET,
        assetId: serializeCV(Cl.uint(SIP9_ASSET_ID)),
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_transferSip9Nft'>;
    },
    expect: 'manual',
    tags: ['funds'],
  },

  // ── Contracts ─────────────────────────────────────────────────────────────
  {
    id: 'stx_deployContract',
    method: 'stx_deployContract',
    label: 'stx_deployContract',
    category: 'Stacks',
    description: 'Deploy a tiny hello-world contract on the selected network.',
    params(ctx) {
      return {
        name: 'leather-rpc-hello-world',
        clarityCode: helloWorldContract,
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_deployContract'>;
    },
    expect: 'manual',
    tags: ['funds'],
  },

  // ── Signing ───────────────────────────────────────────────────────────────
  {
    id: 'stx_signMessage-utf8',
    method: 'stx_signMessage',
    label: 'stx_signMessage (utf8)',
    category: 'Stacks',
    description: 'Sign a plain UTF-8 message with the STX key.',
    params(ctx) {
      return {
        messageType: 'utf8',
        message: TEST_MESSAGE,
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_signMessage'>;
    },
    expect: 'success',
    tags: ['ci'],
  },
  {
    id: 'stx_signMessage-structured',
    method: 'stx_signMessage',
    label: 'stx_signMessage (structured)',
    category: 'Stacks',
    description:
      'Sign SIP-018 structured data. The domain’s chain-id follows the selected network, so a testnet run does not sign a mainnet domain.',
    params(ctx) {
      const network = networkOf(ctx);
      return {
        messageType: 'structured',
        domain: structuredDomain(chainIdFor(network)),
        message: structuredMessage,
        network,
      } satisfies ParamsOf<'stx_signMessage'>;
    },
    expect: 'success',
    tags: ['ci'],
  },
  {
    id: 'stx_signStructuredMessage',
    method: 'stx_signStructuredMessage',
    label: 'stx_signStructuredMessage',
    category: 'Stacks',
    description: 'Legacy structured-data signing (domain + message as hex CVs).',
    params(ctx) {
      return {
        domain: structuredDomain(chainIdFor(networkOf(ctx))),
        message: structuredMessage,
      } satisfies ParamsOf<'stx_signStructuredMessage'>;
    },
    expect: 'success',
    tags: ['ci', 'legacy'],
  },
  {
    id: 'stx_signTransaction-sip30',
    method: 'stx_signTransaction',
    label: 'stx_signTransaction (SIP-30)',
    category: 'Stacks',
    description:
      'Reads your STX public key (getAddresses prompt), builds an unsigned STX transfer from it and asks to sign it (SIP-30 `transaction`).',
    async params(ctx) {
      const network = networkOf(ctx);
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        transaction: await buildUnsignedStxTransferHex({
          publicKey,
          recipient: STX_RECIPIENT,
          mode: networkModeOf(network),
        }),
        network,
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci'],
    verify: verifyStxTransaction(),
  },
  {
    id: 'stx_signTransaction-contract-call',
    method: 'stx_signTransaction',
    label: 'stx_signTransaction (contract call)',
    category: 'Stacks',
    description:
      'An unsigned CONTRACT CALL rather than a transfer — the shape that forces the approval screen to decode a payload instead of an amount.',
    async params(ctx) {
      const network = networkOf(ctx);
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        transaction: await buildUnsignedContractCallHex({
          publicKey,
          contract: SIP10_CONTRACT,
          functionName: 'get-name',
          functionArgs: [],
          mode: networkModeOf(network),
        }),
        network,
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci'],
    verify: verifyStxTransaction({ contract: SIP10_CONTRACT, functionName: 'get-name' }),
  },
  {
    id: 'stx_signTransaction-legacy',
    method: 'stx_signTransaction',
    label: 'stx_signTransaction (legacy txHex)',
    category: 'Stacks',
    description: 'The same unsigned transfer, sent as the legacy `txHex` param.',
    async params(ctx) {
      const network = networkOf(ctx);
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        txHex: await buildUnsignedStxTransferHex({
          publicKey,
          recipient: STX_RECIPIENT,
          mode: networkModeOf(network),
        }),
        network,
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci', 'legacy'],
    verify: verifyStxTransaction(),
  },

  // ── Removed methods ───────────────────────────────────────────────────────
  {
    id: 'stx_getNetworks',
    method: 'stx_getNetworks',
    label: 'stx_getNetworks (removed)',
    category: 'Stacks',
    description:
      'Removed from the extension. Kept as a negative test: it should answer "not supported" rather than silently resolve.',
    expect: { extension: { error: 4002 } },
    tags: ['negative'],
  },
];
