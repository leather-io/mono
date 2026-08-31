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
      "Returns wallet version + supported methods on Leather MOBILE's in-app browser. The extension has no handler and answers with a 'not supported' error.",
    expect: { extension: { error: 4002 }, mobile: 'success' },
    tags: ['ci'],
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
    id: 'open-popup',
    method: 'open',
    label: 'open (popup)',
    category: 'General',
    description: 'Opens the wallet in popup mode.',
    params: { mode: 'popup' } satisfies ParamsOf<'open'>,
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
];
