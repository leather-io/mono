import type { BrowserContext, Page } from '@playwright/test';

import { TEST_ACCOUNT_1_STX_ADDRESS } from './constants';

const mockedStacksConfirmedTransactions = [
  {
    tx: {
      tx_id: '0xae98b9512a5a196ea0f1566101d21a6e7230ff822489fc42920c9cfb5d3b0c1c',
      nonce: 15,
      fee_rate: '1082754',
      sender_address: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT',
      sponsored: false,
      post_condition_mode: 'allow',
      post_conditions: [],
      anchor_mode: 'on_chain_only',
      block_hash: '0x420f7e5227a366554d1c8032c0c7d8de730a45a8e662038d6eff43db6beaa0cc',
      block_height: 148809,
      block_time: 1714836180,
      block_time_iso: '2024-05-04T15:23:00.000Z',
      burn_block_time: 1714836115,
      burn_block_height: 842073,
      burn_block_time_iso: '2024-05-04T15:21:55.000Z',
      parent_burn_block_time: 1714835943,
      parent_burn_block_time_iso: '2024-05-04T15:19:03.000Z',
      canonical: true,
      tx_index: 50,
      tx_status: 'success',
      tx_result: {
        hex: '0x0703',
        repr: '(ok true)',
      },
      event_count: 5000,
      parent_block_hash: '0xb7a831ee14dfc833c43789b47de1b4b0c14474736cfeec751eef5243bceeec8f',
      is_unanchored: false,
      microblock_hash: '0x',
      microblock_sequence: 2147483647,
      microblock_canonical: true,
      execution_cost_read_count: 10101,
      execution_cost_read_length: 65601,
      execution_cost_runtime: 109032754,
      execution_cost_write_count: 10002,
      execution_cost_write_length: 476286,
      events: [],
      tx_type: 'smart_contract',
      smart_contract: {
        clarity_version: 2,
        contract_id: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT.Alex-is-the-next-Uniswap',
        source_code: '',
      },
    },
    stx_sent: '0',
    stx_received: '0',
    stx_transfers: [],
    ft_transfers: [
      {
        amount: '30000000000',
        asset_identifier: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT.blockstack::BLOCKSTACK',
        sender: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT',
        recipient: 'SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE',
      },
    ],
    nft_transfers: [],
  },
];

const mockedStacksPendingTransaction = {
  tx_id: '0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4',
  nonce: 14,
  fee_rate: '3000',
  sender_address: TEST_ACCOUNT_1_STX_ADDRESS,
  sponsored: false,
  post_condition_mode: 'deny',
  post_conditions: [],
  anchor_mode: 'any',
  tx_status: 'pending',
  receipt_time: 1729168336,
  receipt_time_iso: '2024-10-17T12:32:16.000Z',
  tx_type: 'token_transfer',
  token_transfer: {
    recipient_address: 'ST3WSKSKGNFCDGJN9EXF6AC9NFF69XNNFXN2DQA7E',
    amount: '1000000',
    memo: '0x00000000000000000000000000000000000000000000000000000000000000000000',
  },
};

const mockedStacksTxsRequestWithPendingTx = {
  limit: 50,
  offset: 0,
  total: 1,
  results: [mockedStacksPendingTransaction],
};

const emptyTxsResponse = { limit: 50, offset: 0, total: 0, results: [] };

// Hiro v3 is cursor-paginated rather than limit/offset, and the paginator reads
// `cursor.next` unconditionally, so it needs its own empty shape.
const emptyPrincipalTxsResponse = { results: [], cursor: { current: null, next: null } };

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

const transactionWithTransfersUrl = `**/api.hiro.so/extended/v1/address/${TEST_ACCOUNT_1_STX_ADDRESS}/transactions_with_transfers?limit=50`;
const mempoolUrl = `**/api.hiro.so/extended/v1/tx/mempool?address=${TEST_ACCOUNT_1_STX_ADDRESS}&limit=50`;

export async function mockMainnetTestAccountStacksTxsRequests(page: Page | BrowserContext) {
  await Promise.all([
    page.route(transactionWithTransfersUrl, route =>
      route.fulfill({
        json: emptyTxsResponse,
      })
    ),

    page.route(mempoolUrl, route =>
      route.fulfill({
        json: emptyTxsResponse,
      })
    ),
  ]);
}

export async function mockWildcardStacksTxsRequests(page: Page | BrowserContext) {
  await Promise.all([
    page.route('**/api.hiro.so/extended/v1/address/*/transactions_with_transfers?limit=50', route =>
      route.fulfill({ json: emptyTxsResponse })
    ),
    page.route('**/api.hiro.so/extended/v2/addresses/*/transactions**', route =>
      route.fulfill({ json: emptyTxsResponse })
    ),
    page.route('**/api.hiro.so/extended/v1/tx/mempool?address=*', route =>
      route.fulfill({ json: emptyTxsResponse })
    ),
    page.route('**/api.hiro.so/extended/v1/address/*/assets**', route =>
      route.fulfill({ json: { limit: 100, offset: 0, total: 0, results: [] } })
    ),
    page.route('**/api.hiro.so/extended/v3/principals/*/transactions**', route =>
      route.fulfill({ json: emptyPrincipalTxsResponse })
    ),
    page.route('**/api.hiro.so/extended/v3/principals/*/balance-changes**', route =>
      route.fulfill({ json: emptyPrincipalTxsResponse })
    ),
  ]);
}

export async function mockMainnetTestAccountStacksConfirmedTxsRequests(
  page: Page | BrowserContext
) {
  await Promise.all([
    page.route(transactionWithTransfersUrl, route =>
      route.fulfill({
        json: {
          limit: 50,
          offset: 0,
          total: 0,
          results: mockedStacksConfirmedTransactions,
        },
      })
    ),
    page.route(
      `**/api.hiro.so/extended/v3/principals/${TEST_ACCOUNT_1_STX_ADDRESS}/transactions**`,
      route => route.fulfill({ json: mockedPrincipalTxsResponseWithReceiveTx })
    ),
  ]);
}

export async function mockTestAccountStacksTxsRequestsWithPendingTx(page: Page | BrowserContext) {
  await page.route(mempoolUrl, route =>
    route.fulfill({
      json: mockedStacksTxsRequestWithPendingTx,
    })
  );
}

const mockedPendingRawTx = {
  raw_tx:
    '0x80800000000400fff493c4bfd46883c20368a72abd4f381ded75e1000000000000000e0000000000000bb800016179b365db452be698ef57cd8702b2ddecf3914342d70f960a80fd1221b72df1338b3f1b089843c99f2cb36e8562712901590a06c2f2aa22c5ca3be9e1de80cf03020000000000051af999e670abd8d84aa9775e6531357bcc9ed6afed00000000000f424000000000000000000000000000000000000000000000000000000000000000000000',
};

export async function mockStacksRawTx(page: Page | BrowserContext) {
  await page.route(
    `**/api.hiro.so/extended/v1/tx/0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4/raw`,
    route =>
      route.fulfill({
        json: mockedPendingRawTx,
      })
  );
}

export async function mockStacksPendingTransaction(page: Page | BrowserContext) {
  await page.route(
    `**/api.hiro.so/extended/v1/tx/0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4`,
    route =>
      route.fulfill({
        json: mockedStacksPendingTransaction,
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

  await page.route(`**/api.hiro.so/extended/v1/tx/${txid}`, route =>
    route.fulfill({
      json: {
        tx_id: txid,
        nonce: 0,
        fee_rate: '1000',
        sender_address: TEST_ACCOUNT_1_STX_ADDRESS,
        sponsored: false,
        post_condition_mode: 'allow',
        post_conditions: [],
        anchor_mode: 'any',
        tx_status: 'pending',
        receipt_time: Date.now() / 1000,
        receipt_time_iso: new Date().toISOString(),
        tx_type: 'contract_call',
        contract_call: {
          contract_id: 'SP000000000000000000002Q6VF78.leather-integration-tests',
          function_name: 'transfer',
          function_signature: '',
          function_args: [],
        },
      },
    })
  );

  return txid;
}

export async function mockSip10LeatherTestTokenBalance(page: Page | BrowserContext) {
  await page.route(`**/api.hiro.so/extended/v2/addresses/*/balances`, route =>
    route.fulfill({
      json: {
        limit: 100,
        offset: 0,
        total: 55,
        results: [
          {
            token: 'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
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
