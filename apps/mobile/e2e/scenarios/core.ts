import { HttpResponse, type RequestHandler, http } from 'msw';

import { pendingStxTransfer } from '../fixtures/stacks';
import { bnsHandlers } from '../handlers/bns';
import {
  ftBalancesHandler,
  nftBalancesHandler,
  stacksMempoolHandler,
  stacksNoncesHandler,
  stacksTransactionsHandlers,
  stxBalanceHandler,
} from '../handlers/hiro';
import {
  bitcoinTransactionsHandlers,
  bitcoinUtxosHandlers,
  complianceHandler,
} from '../handlers/leather-api';
import { hiroUrl, leatherApiUrl, mempoolUrl } from '../handlers/urls';

function none() {
  return [];
}

const emptyBalances = [
  stxBalanceHandler('0'),
  ftBalancesHandler([]),
  ...bitcoinUtxosHandlers(none),
  nftBalancesHandler([]),
];

const emptyActivity = [
  ...bitcoinTransactionsHandlers(none),
  ...stacksTransactionsHandlers(none, none),
  stacksMempoolHandler(none),
  stacksNoncesHandler(0),
];

export const coreScenarios: Record<string, RequestHandler[]> = {
  'empty-wallet': [...emptyBalances, ...emptyActivity],
  'empty-balances': emptyBalances,
  'empty-activity': emptyActivity,
  'no-nfts': [nftBalancesHandler([])],
  'bns-name': bnsHandlers({ name: 'leather', namespace: 'btc' }),
  'stacks-pending-tx': [stacksMempoolHandler(address => [pendingStxTransfer(address)])],
  'compliance-non-compliant': [complianceHandler('non_compliant')],
  'compliance-down': [
    http.get(leatherApiUrl('/v1/compliance/addresses/:segment'), () => HttpResponse.error()),
  ],
  'broadcast-fail': [
    http.post(mempoolUrl('/tx'), () =>
      HttpResponse.text('sendrawtransaction RPC error: bad-txns-inputs-missingorspent', {
        status: 400,
      })
    ),
    http.post(hiroUrl('/v2/transactions'), () =>
      HttpResponse.json(
        { error: 'transaction rejected', reason: 'BadNonce', txid: '' },
        { status: 400 }
      )
    ),
  ],
};
