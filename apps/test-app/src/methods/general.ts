// Wallet-level requests: info, capabilities, address sharing, opening the UI.
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyAddresses } from '../verifiers/spec-verifiers';

export const generalMethods: RpcMethodSpec[] = [
  {
    id: 'getInfo',
    method: 'getInfo',
    label: 'getInfo (mobile only)',
    category: 'General',
    description:
      "Returns wallet version + supported methods on Leather MOBILE's in-app browser. The extension has no handler and answers with a 'not supported' error — a handy negative test.",
    expect: { extension: { error: 4002 }, mobile: 'success' },
    tags: ['ci', 'negative'],
  },
  {
    id: 'supportedMethods',
    method: 'supportedMethods',
    label: 'supportedMethods',
    category: 'General',
    description: 'Lists the RPC methods this wallet build supports. No prompt.',
    expect: 'success',
    tags: ['ci'],
  },
  {
    id: 'getAddresses',
    method: 'getAddresses',
    label: 'getAddresses',
    category: 'General',
    description: 'Prompts the user to share their BTC + STX addresses on the selected network.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci'],
    verify: verifyAddresses({ bitcoin: true, stacks: true }),
  },
  {
    id: 'getAddresses-bitcoin-only',
    method: 'getAddresses',
    label: 'getAddresses (chains: bitcoin)',
    category: 'General',
    description:
      'Asks for BTC addresses only, the way the multisig dApp signs in. The response must carry no STX entries.',
    params(ctx) {
      return { network: networkOf(ctx), chains: ['bitcoin'] } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['ci'],
    verify: verifyAddresses({ bitcoin: true, stacks: false }),
  },
  {
    id: 'getAddresses-stacks-only',
    method: 'getAddresses',
    label: 'getAddresses (chains: stacks)',
    category: 'General',
    description: 'Asks for STX addresses only. The response must carry no BTC entries.',
    params(ctx) {
      return { network: networkOf(ctx), chains: ['stacks'] } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['ci'],
    verify: verifyAddresses({ bitcoin: false, stacks: true }),
  },
  {
    id: 'open-popup',
    method: 'open',
    label: 'open (popup)',
    category: 'General',
    description: 'Opens the wallet in popup mode.',
    params: { mode: 'popup' } satisfies ParamsOf<'open'>,
    expect: 'success',
  },
  {
    id: 'open-fullpage',
    method: 'open',
    label: 'open (fullpage)',
    category: 'General',
    description: 'Opens the wallet in full-page mode.',
    params: { mode: 'fullpage' } satisfies ParamsOf<'open'>,
    expect: 'success',
  },
  {
    id: 'openSwap',
    method: 'openSwap',
    label: 'openSwap',
    category: 'General',
    description: 'Opens the swap UI pre-filled with a base/quote pair.',
    params: { base: 'STX', quote: 'sBTC' } satisfies ParamsOf<'openSwap'>,
    expect: 'success',
  },

  // ── Negative ──────────────────────────────────────────────────────────────
  {
    id: 'unknown-method',
    method: 'leather_notAMethod',
    label: 'unknown method',
    category: 'General',
    description:
      'A method no build implements. The provider should answer METHOD_NOT_FOUND / not-supported rather than hang or resolve.',
    expect: { extension: { error: 4002 } },
    tags: ['ci', 'negative'],
  },
  {
    id: 'invalid-params',
    method: 'sendTransfer',
    label: 'invalid params',
    category: 'Bitcoin',
    description:
      'sendTransfer with a recipients array of the wrong shape. The wallet should reject with INVALID_PARAMS before showing any approval UI.',
    params: { recipients: [{ address: 42, amount: true }], network: 'mainnet' },
    expect: { extension: { error: -32602 } },
    tags: ['ci', 'negative'],
  },
];
