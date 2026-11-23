import type { BrowserContext, Page } from '@playwright/test';

import { TEST_ACCOUNT_1_STX_ADDRESS } from './constants';

const mockedStacksPendingTransaction = {
  tx_id: '0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4',
  sender: { address: TEST_ACCOUNT_1_STX_ADDRESS, nonce: 14 },
  sponsor: null,
  fee_rate: '3000',
  receipt_time: 1729168336,
  receipt_time_iso: '2024-10-17T12:32:16.000Z',
  receipt_block_height: 1000,
  status: 'pending',
  type: 'token_transfer',
  token_transfer: {
    recipient: 'ST3WSKSKGNFCDGJN9EXF6AC9NFF69XNNFXN2DQA7E',
    amount: '1000000',
    memo: null,
  },
};

const mockedStacksPendingTransactionV3 = {
  tx_id: mockedStacksPendingTransaction.tx_id,
  sender: { address: TEST_ACCOUNT_1_STX_ADDRESS, nonce: 14 },
  sponsor: null,
  fee_rate: '3000',
  receipt_time: 1729168336,
  receipt_block_height: 1000,
  status: 'pending',
  replaced_by_tx_id: null,
  type: 'token_transfer',
  token_transfer: {
    recipient: 'ST3WSKSKGNFCDGJN9EXF6AC9NFF69XNNFXN2DQA7E',
    amount: '1000000',
    memo: null,
  },
};

const mockedStacksTxsRequestWithPendingTx = {
  limit: 50,
  total: 1,
  cursor: {
    next: null,
    previous: null,
    current: `${mockedStacksPendingTransaction.receipt_time}:${mockedStacksPendingTransaction.tx_id}`,
  },
  results: [mockedStacksPendingTransaction],
};

// Hiro v3 is cursor-paginated rather than limit/offset, and the paginator reads
// `cursor.next` unconditionally, so it needs its own empty shape.
const emptyPrincipalTxsResponse = { results: [], cursor: { current: null, next: null } };
const emptyNoncesResponse = {
  next_nonce: 0,
  last_confirmed_nonce: null,
  mempool: { last_nonce: null, pending_nonces: [], missing_nonces: [] },
};

const mockedPrincipalReceiveTxResultItem = {
  transaction: {
    tx_id: '0xae98b9512a5a196ea0f1566101d21a6e7230ff822489fc42920c9cfb5d3b0c1c',
    type: 'token_transfer',
    sender: { address: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT', nonce: 15 },
    sponsor: null,
    fee_rate: '300',
    block: {
      height: 148809,
      hash: '0x420f7e5227a366554d1c8032c0c7d8de730a45a8e662038d6eff43db6beaa0cc',
      index_hash: '0x420f7e5227a366554d1c8032c0c7d8de730a45a8e662038d6eff43db6beaa0cc',
      time: 1714836180,
      tx_index: 50,
    },
    bitcoin_block: { height: 842073, time: 1714836115 },
    status: 'success',
    token_transfer: {
      recipient: TEST_ACCOUNT_1_STX_ADDRESS,
      amount: '5000000',
      memo: null,
    },
  },
  involvement: 'affected',
  balance_changes: { stx: { sent: '0', received: '5000000', net: '5000000' } },
  affected_balances: { stx: true, ft: false, nft: false },
};

const mockedPrincipalTxsResponseWithReceiveTx = {
  total: 1,
  limit: 50,
  cursor: { next: null, previous: null, current: null },
  results: [mockedPrincipalReceiveTxResultItem],
};

const principalTxsUrl = `**/api.hiro.so/extended/v3/principals/${TEST_ACCOUNT_1_STX_ADDRESS}/transactions**`;
const mempoolUrl = `**/api.hiro.so/extended/v3/principals/${TEST_ACCOUNT_1_STX_ADDRESS}/mempool/transactions**`;

export async function mockMainnetTestAccountStacksTxsRequests(page: Page | BrowserContext) {
  await Promise.all([
    page.route(principalTxsUrl, route =>
      route.fulfill({
        json: emptyPrincipalTxsResponse,
      })
    ),

    page.route(mempoolUrl, route =>
      route.fulfill({
        json: emptyPrincipalTxsResponse,
      })
    ),
  ]);
}

export async function mockWildcardStacksTxsRequests(page: Page | BrowserContext) {
  await Promise.all([
    page.route('**hiro.so/extended/v3/principals/*/mempool/transactions**', route =>
      route.fulfill({ json: emptyPrincipalTxsResponse })
    ),
    page.route('**hiro.so/extended/v1/address/*/assets**', route =>
      route.fulfill({ json: { limit: 100, offset: 0, total: 0, results: [] } })
    ),
    page.route('**hiro.so/extended/v3/principals/*/transactions**', route =>
      route.fulfill({ json: emptyPrincipalTxsResponse })
    ),
    page.route('**hiro.so/extended/v3/principals/*/balance-changes**', route =>
      route.fulfill({ json: emptyPrincipalTxsResponse })
    ),
    page.route('**hiro.so/extended/v3/principals/*/nonces', route =>
      route.fulfill({ json: emptyNoncesResponse })
    ),
  ]);
}

export async function mockMainnetTestAccountStacksConfirmedTxsRequests(
  page: Page | BrowserContext
) {
  await page.route(principalTxsUrl, route =>
    route.fulfill({ json: mockedPrincipalTxsResponseWithReceiveTx })
  );
}

export async function mockTestAccountStacksTxsRequestsWithPendingTx(page: Page | BrowserContext) {
  await page.route(mempoolUrl, route =>
    route.fulfill({
      json: mockedStacksTxsRequestWithPendingTx,
    })
  );
}

const mockedPendingRawTx = {
  raw: '0x80800000000400fff493c4bfd46883c20368a72abd4f381ded75e1000000000000000e0000000000000bb800016179b365db452be698ef57cd8702b2ddecf3914342d70f960a80fd1221b72df1338b3f1b089843c99f2cb36e8562712901590a06c2f2aa22c5ca3be9e1de80cf03020000000000051af999e670abd8d84aa9775e6531357bcc9ed6afed00000000000f424000000000000000000000000000000000000000000000000000000000000000000000',
};

export async function mockStacksRawTx(page: Page | BrowserContext) {
  await page.route(
    `**/api.hiro.so/extended/v3/transactions/0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4/raw`,
    route =>
      route.fulfill({
        json: mockedPendingRawTx,
      })
  );
}

export async function mockStacksPendingTransaction(page: Page | BrowserContext) {
  await page.route(
    `**/api.hiro.so/extended/v3/transactions/0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4`,
    route =>
      route.fulfill({
        json: mockedStacksPendingTransactionV3,
      })
  );
}

export async function mockStacksBroadcastTransaction(page: Page | BrowserContext) {
  const txid = '9b709768122e6c62a37b087106cc9c23280ed6242b565484b6cc4e6a43ae1155';

  await page.route(`**/api.hiro.so/v2/transactions`, route =>
    route.fulfill({
      body: txid,
    })
  );

  await page.route(`**/api.hiro.so/extended/v3/transactions/${txid}`, route =>
    route.fulfill({
      json: {
        tx_id: txid,
        sender: { address: TEST_ACCOUNT_1_STX_ADDRESS, nonce: 0 },
        sponsor: null,
        fee_rate: '1000',
        receipt_time: Math.floor(Date.now() / 1000),
        receipt_block_height: 1000,
        status: 'pending',
        replaced_by_tx_id: null,
        type: 'contract_call',
        contract_call: {
          contract_id: 'SP000000000000000000002Q6VF78.leather-integration-tests',
          function_name: 'transfer',
        },
      },
    })
  );

  return txid;
}

export async function mockSip10LeatherTestTokenBalance(page: Page | BrowserContext) {
  await page.route(`**/api.hiro.so/extended/v3/principals/*/balances/ft**`, route =>
    route.fulfill({
      json: {
        limit: 200,
        total: 1,
        cursor: { next: null, previous: null, current: null },
        results: [
          {
            asset_identifier:
              'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
            balance: '114736',
          },
        ],
      },
    })
  );
  await page.route(`**/staging.api.leather.io/v1/tokens/sip10s`, route =>
    route.fulfill({
      json: {
        format: 'map',
        meta: {
          count: 189,
          timestamp: '2026-01-14T12:34:02.230Z',
        },
        data: {
          'SP000000000000000000002Q6VF78.leather-integration-tests': {
            assetIdentifier:
              'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
            name: 'Leather test token',
            symbol: 'LTT',
            decimals: 6,
            image:
              'https://images.leather.io/tokens/SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx.svg',
          },
        },
      },
    })
  );
  await page.route(`**/staging.api.leather.io/v1/app-config`, route =>
    route.fulfill({
      json: {
        assets: {
          defaultEnabled: [
            'sip10|SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
          ],
        },
        fees: {
          stacks: {
            minimumRelayFeeRate: 1,
            globalMaximumFee: 5000000,
            transfers: {
              low: {
                minimum: 180,
                default: 240,
                maximum: 299,
              },
              standard: {
                minimum: 300,
                default: 400,
                maximum: 800,
              },
              high: {
                minimum: 801,
                default: 901,
                maximum: 1001,
              },
            },
            contractCalls: {
              low: {
                minimum: 500,
                default: 1750,
                maximum: 2999,
              },
              standard: {
                minimum: 3000,
                default: 3750,
                maximum: 10000,
              },
              high: {
                minimum: 10001,
                default: 50001,
                maximum: 1000001,
              },
            },
            contractDeployments: {
              low: {
                minimum: 10000,
                default: 30000,
                maximum: 50000,
              },
              standard: {
                minimum: 50001,
                default: 100002,
                maximum: 500000,
              },
              high: {
                minimum: 1000001,
                default: 1500000,
                maximum: 2000001,
              },
            },
            sipTokenSends: {
              low: {
                minimum: 500,
                default: 600,
                maximum: 700,
              },
              standard: {
                minimum: 701,
                default: 1751,
                maximum: 4000,
              },
              high: {
                minimum: 4001,
                default: 4002,
                maximum: 10001,
              },
            },
          },
        },
      },
    })
  );
}
