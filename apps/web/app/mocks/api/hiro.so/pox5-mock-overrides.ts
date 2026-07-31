import { HttpResponse, http } from 'msw';
import { pox5NetworkConfig } from '~/data/pox5-network-config';

import { hiroInfoHandler } from './info';
import {
  pox5GetStakerInfoCustomStakedHandler,
  pox5GetStakerInfoStakedHandler,
} from './pox5-get-staker-info';

// In mock mode the app boots its own MSW worker with the statically built
// successHandlers, so Playwright-level per-test overrides never see these
// requests. These handlers run inside the page, read localStorage flags set by
// tests, and fall through (return undefined) to the static handlers when the
// flag is absent — including when evaluated in the node-side test fixture,
// where localStorage does not exist.
function getMockFlag(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

// Override paths target the configured pox-5 host, where the pinned pox-5 read
// layer sends these requests.
const stxBalancePath = `${pox5NetworkConfig.apiUrl}/extended/v2/addresses/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST/balances/stx`;

const mempoolPathSegment = 'mempool';
const defaultMockTxStatus = 'success';
const notFoundMockTxStatus = 'not-found';

export const pox5MockOverrideHandlers = [
  http.post(pox5GetStakerInfoCustomStakedHandler.path, () => {
    if (getMockFlag('leather-mock-pox5-staked-custom') !== 'true') return undefined;
    return HttpResponse.json(pox5GetStakerInfoCustomStakedHandler.resp);
  }),
  http.post(pox5GetStakerInfoStakedHandler.path, () => {
    if (getMockFlag('leather-mock-pox5-staked') !== 'true') return undefined;
    return HttpResponse.json(pox5GetStakerInfoStakedHandler.resp);
  }),
  http.get(`${pox5NetworkConfig.apiUrl}/v2/info`, () => {
    const burnHeight = getMockFlag('leather-mock-burn-height');
    if (!burnHeight) return undefined;
    return HttpResponse.json({ ...hiroInfoHandler.resp, burn_block_height: Number(burnHeight) });
  }),
  http.get(`${pox5NetworkConfig.apiUrl}/extended/v1/tx/:txId`, ({ params }) => {
    if (params.txId === mempoolPathSegment) return undefined;
    const status = getMockFlag('leather-mock-pox5-tx-status') ?? defaultMockTxStatus;
    if (status === notFoundMockTxStatus) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      tx_id: params.txId,
      tx_status: status,
      tx_type: 'contract_call',
    });
  }),
  http.get(stxBalancePath, () => {
    const balance = getMockFlag('leather-mock-stx-balance');
    if (!balance) return undefined;
    return HttpResponse.json({
      balance,
      total_miner_rewards_received: '0',
      lock_tx_id: '',
      locked: '0',
      lock_height: 0,
      burnchain_lock_height: 0,
      burnchain_unlock_height: 0,
    });
  }),
];
