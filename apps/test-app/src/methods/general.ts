// Wallet-level requests: info, capabilities, address sharing, opening the UI.
import type { ParamsOf, RpcMethodSpec } from '../types';

export const generalMethods: RpcMethodSpec[] = [
  {
    id: 'getInfo',
    method: 'getInfo',
    label: 'getInfo (mobile only)',
    category: 'General',
    description:
      "Returns wallet version + supported methods on Leather MOBILE's in-app browser. The extension has no handler and answers with a 'not supported' error — a handy negative test.",
  },
  {
    id: 'supportedMethods',
    method: 'supportedMethods',
    label: 'supportedMethods',
    category: 'General',
    description: 'Lists the RPC methods this wallet build supports. No prompt.',
  },
  {
    id: 'getAddresses',
    method: 'getAddresses',
    label: 'getAddresses',
    category: 'General',
    description: 'Prompts the user to share their BTC + STX mainnet addresses.',
  },
  {
    id: 'getAddresses-private',
    method: 'getAddresses',
    label: 'getAddresses (private)',
    category: 'General',
    description:
      'Prompts the user to share their BTC + STX addresses for the private (regtest) network — bcrt1… / ST… keys.',
    params: { network: 'private' } satisfies ParamsOf<'getAddresses'>,
  },
  {
    id: 'open-popup',
    method: 'open',
    label: 'open (popup)',
    category: 'General',
    description: 'Opens the wallet in popup mode.',
    params: { mode: 'popup' } satisfies ParamsOf<'open'>,
  },
  {
    id: 'open-fullpage',
    method: 'open',
    label: 'open (fullpage)',
    category: 'General',
    description: 'Opens the wallet in full-page mode.',
    params: { mode: 'fullpage' } satisfies ParamsOf<'open'>,
  },
  {
    id: 'openSwap',
    method: 'openSwap',
    label: 'openSwap',
    category: 'General',
    description: 'Opens the swap UI pre-filled with a base/quote pair.',
    params: { base: 'STX', quote: 'sBTC' } satisfies ParamsOf<'openSwap'>,
  },
];
