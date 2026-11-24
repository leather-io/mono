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
  await page.route(`**/api.hiro.so/extended/v3/principals/${address}/balances/nft**`, route =>
    route.fulfill({
      json: {
        limit: 200,
        total: 1,
        cursor: {
          next: null,
          previous: null,
          current: `${exampleNftAssetIdentifier}:${exampleNftTokenIdHex}`,
        },
        results: [
          {
            asset_identifier: exampleNftAssetIdentifier,
            value: { hex: exampleNftTokenIdHex, repr: 'u1' },
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
}

export async function mockStacksPolicyData(page: Page | BrowserContext, address: string) {
  await mockPolicyStacksNftHoldings(page, address);
  await mockPolicyStacksReceiveActivity(page, address);
}
