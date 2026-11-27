import { deserializeTransaction } from '@stacks/transactions';
import { HttpResponse, http } from 'msw';

import { recordBroadcast } from '../e2e-state';
import { type FtBalance, fundedFtBalances } from '../fixtures/sip10';
import {
  accountNonces,
  cursorPage,
  externalStacksAddress,
  fundedBalanceChanges,
  fundedNextNonce,
  fundedPrincipalTransactions,
  fundedStxBalanceOf,
  nftHoldings,
  nftMetadata,
  pendingStxTransfer,
  sip10TransferInterface,
  stacksFeeEstimate,
  stxBalance,
} from '../fixtures/stacks';
import { hiroUrl, readPathSegment, readSearchParam } from './urls';

type ReadByAddress = (address: string) => unknown[];

const poxInfo = {
  contract_id: 'SP000000000000000000002Q6VF78.pox-4',
  first_burnchain_block_height: 666050,
  current_burnchain_block_height: 920000,
  prepare_phase_block_length: 100,
  reward_phase_block_length: 2000,
  reward_cycle_length: 2100,
  current_cycle: {
    id: 120,
    min_threshold_ustx: 100000000000,
    stacked_ustx: 0,
    is_pox_active: true,
  },
  next_cycle: { id: 121, min_threshold_ustx: 100000000000, stacked_ustx: 0 },
  min_amount_ustx: 100000000000,
};

function isFirstPage(url: string) {
  return readSearchParam(url, 'cursor') === null;
}

function readTxIds(url: string) {
  return (readSearchParam(url, 'tx_id') ?? '').split(',').filter(txId => txId.length > 0);
}

function readBroadcastHex(body: string) {
  const parsed: unknown = body.trim().startsWith('{') ? JSON.parse(body) : body;
  const hex =
    typeof parsed === 'object' && parsed !== null && 'tx' in parsed ? String(parsed.tx) : body;
  return hex.trim().replace(/^0x/, '');
}

function readTransaction(body: string) {
  try {
    return deserializeTransaction(readBroadcastHex(body));
  } catch {
    return null;
  }
}

function rejectTransaction(reason: string) {
  return HttpResponse.json({ error: 'transaction rejected', reason, txid: '' }, { status: 400 });
}

function broadcast(body: string) {
  const tx = readTransaction(body);
  if (!tx) return rejectTransaction('Deserialization');
  try {
    tx.verifyOrigin();
  } catch {
    return rejectTransaction('SignatureValidation');
  }
  const txid = tx.txid();
  recordBroadcast('stacks', txid);
  return HttpResponse.json(txid);
}

export function stxBalanceHandler(balance: string | ((address: string) => string)) {
  return http.get(hiroUrl('/extended/v3/principals/:segment/balances/stx'), ({ request }) =>
    HttpResponse.json(
      stxBalance(typeof balance === 'string' ? balance : balance(readPathSegment(request.url, -3)))
    )
  );
}

export function ftBalancesHandler(balances: FtBalance[]) {
  return http.get(hiroUrl('/extended/v3/principals/:segment/balances/ft'), () =>
    HttpResponse.json({ ...cursorPage(balances), limit: 200 })
  );
}

export function stacksTransactionsHandlers(
  readTransactions: ReadByAddress,
  readBalanceChanges: (txIds: string[]) => unknown[]
) {
  return [
    http.get(hiroUrl('/extended/v3/principals/:segment/transactions'), ({ request }) =>
      HttpResponse.json(
        cursorPage(
          isFirstPage(request.url) ? readTransactions(readPathSegment(request.url, -2)) : []
        )
      )
    ),
    http.get(hiroUrl('/extended/v3/principals/:segment/balance-changes'), ({ request }) =>
      HttpResponse.json(cursorPage(readBalanceChanges(readTxIds(request.url))))
    ),
  ];
}

export function stacksMempoolHandler(readPending: ReadByAddress) {
  return http.get(hiroUrl('/extended/v3/principals/:segment/mempool/transactions'), ({ request }) =>
    HttpResponse.json(cursorPage(readPending(readPathSegment(request.url, -3))))
  );
}

export function stacksNoncesHandler(nextNonce: number) {
  return http.get(hiroUrl('/extended/v3/principals/:segment/nonces'), () =>
    HttpResponse.json(accountNonces(nextNonce))
  );
}

export function nftBalancesHandler(holdings: unknown[]) {
  return http.get(hiroUrl('/extended/v3/principals/:segment/balances/nft'), () =>
    HttpResponse.json({ ...cursorPage(holdings), limit: 200 })
  );
}

export const hiroHandlers = [
  stxBalanceHandler(fundedStxBalanceOf),
  ftBalancesHandler(fundedFtBalances),
  ...stacksTransactionsHandlers(fundedPrincipalTransactions, fundedBalanceChanges),
  stacksMempoolHandler(() => []),
  stacksNoncesHandler(fundedNextNonce),
  nftBalancesHandler(nftHoldings),
  http.get(hiroUrl('/extended/v3/principals/:segment/transfers/ft/:segment'), () =>
    HttpResponse.json(cursorPage([]))
  ),
  http.get(hiroUrl('/extended/v3/staking/bonds'), () =>
    HttpResponse.json({ ...cursorPage([]), limit: 200 })
  ),
  http.get(hiroUrl('/metadata/v1/nft/:segment/:segment'), () => HttpResponse.json(nftMetadata)),
  http.get(hiroUrl('/metadata/v1/ft/:segment'), () =>
    HttpResponse.json({ error: 'Not found' }, { status: 404 })
  ),
  http.get(hiroUrl('/v2/contracts/interface/:segment/:segment'), () =>
    HttpResponse.json(sip10TransferInterface)
  ),
  http.get(hiroUrl('/extended/v3/transactions/:segment'), ({ request }) =>
    HttpResponse.json({
      ...pendingStxTransfer(externalStacksAddress),
      tx_id: `0x${readPathSegment(request.url, -1).replace(/^0x/, '')}`,
    })
  ),
  http.get(hiroUrl('/v2/pox'), () => HttpResponse.json(poxInfo)),
  http.get(hiroUrl('/v2/fees/transfer'), () => HttpResponse.json(1)),
  http.post(hiroUrl('/v2/fees/transaction'), () => HttpResponse.json(stacksFeeEstimate)),
  http.post(hiroUrl('/v2/transactions'), async ({ request }) => broadcast(await request.text())),
];
