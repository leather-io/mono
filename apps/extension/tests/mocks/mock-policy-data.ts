import type { BrowserContext, Page } from '@playwright/test';

// Address-keyed Hiro/Gamma mocks for a Stacks policy (multisig) account. The
// default mock layer keys NFT holdings and Stacks transactions on the singlesig
// test address, so a policy's multisig address falls through to the network. These
// routes are registered after `setupAndUseApiCalls` so they take precedence over
// the wildcards for the policy address only.

const exampleNftAssetIdentifier =
  'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild';

// Clarity `uint` value for token id 1 (type byte 0x01 + 16-byte big-endian value).
const exampleNftTokenIdHex = '0x0100000000000000000000000000000001';

export async function mockPolicyStacksNftHoldings(page: Page | BrowserContext, address: string) {
  await page.route(`**/api.hiro.so/extended/v1/tokens/nft/holdings?principal=${address}*`, route =>
    route.fulfill({
      json: {
        limit: 200,
        offset: 0,
        total: 1,
        results: [
          {
            asset_identifier: exampleNftAssetIdentifier,
            value: { hex: exampleNftTokenIdHex, repr: 'u1' },
            block_height: 150000,
            tx_id: '0x6a1c0c3b5dfb9c92024cf48922ff30726e1ad2016615f1a06e195a2a51b998ae',
          },
        ],
      },
    })
  );

  // NFT metadata resolution (Hiro + Gamma). Returning empty/404 resolves both to
  // null; `createSip9Asset` then derives the name from the asset identifier, which
  // is enough to render a collectible card.
  await page.route('**/metadata/v1/nft/**', route => route.fulfill({ json: {} }));
  await page.route('**/get-stacks-nft*', route => route.fulfill({ status: 404, json: {} }));
}

export async function mockPolicyStacksReceiveActivity(
  page: Page | BrowserContext,
  address: string
) {
  await page.route(`**/api.hiro.so/extended/v3/principals/${address}/transactions**`, route =>
    route.fulfill({
      json: {
        total: 1,
        limit: 50,
        cursor: { next: null, previous: null, current: null },
        results: [
          {
            transaction: {
              tx_id: '0x9b709768122e6c62a37b087106cc9c23280ed6242b565484b6cc4e6a43ae1155',
              type: 'token_transfer',
              sender: { address: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT', nonce: 5 },
              sponsor: null,
              fee_rate: '300',
              block: {
                height: 150000,
                hash: '0x420f7e5227a366554d1c8032c0c7d8de730a45a8e662038d6eff43db6beaa0cc',
                index_hash: '0x420f7e5227a366554d1c8032c0c7d8de730a45a8e662038d6eff43db6beaa0cc',
                time: 1714836180,
                tx_index: 1,
              },
              bitcoin_block: { height: 842073, time: 1714836115 },
              status: 'success',
              token_transfer: {
                recipient: address,
                amount: '5000000',
                memo: null,
              },
            },
            involvement: 'affected',
            balance_changes: { stx: { sent: '0', received: '5000000', net: '5000000' } },
            affected_balances: { stx: true, ft: false, nft: false },
          },
        ],
      },
    })
  );

  await page.route(`**/api.hiro.so/extended/v2/addresses/${address}/transactions*`, route =>
    route.fulfill({
      json: {
        limit: 50,
        offset: 0,
        total: 1,
        results: [
          {
            tx: {
              tx_id: '0x9b709768122e6c62a37b087106cc9c23280ed6242b565484b6cc4e6a43ae1155',
              nonce: 5,
              fee_rate: '300',
              sender_address: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT',
              sponsored: false,
              post_condition_mode: 'allow',
              post_conditions: [],
              anchor_mode: 'any',
              block_hash: '0x420f7e5227a366554d1c8032c0c7d8de730a45a8e662038d6eff43db6beaa0cc',
              block_height: 150000,
              block_time: 1714836180,
              block_time_iso: '2024-05-04T15:23:00.000Z',
              burn_block_time: 1714836115,
              burn_block_height: 842073,
              burn_block_time_iso: '2024-05-04T15:21:55.000Z',
              canonical: true,
              tx_index: 1,
              tx_status: 'success',
              tx_result: { hex: '0x0703', repr: '(ok true)' },
              event_count: 0,
              events: [],
              tx_type: 'token_transfer',
              token_transfer: {
                recipient_address: address,
                amount: '5000000',
                memo: '0x00000000000000000000000000000000000000000000000000000000000000000000',
              },
            },
            stx_sent: '0',
            stx_received: '5000000',
            events: [],
          },
        ],
      },
    })
  );
}

export async function mockStacksPolicyData(page: Page | BrowserContext, address: string) {
  await mockPolicyStacksNftHoldings(page, address);
  await mockPolicyStacksReceiveActivity(page, address);
}
