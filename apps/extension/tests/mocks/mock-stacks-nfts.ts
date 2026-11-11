import type { BrowserContext, Page } from '@playwright/test';
import { Cl, cvToHex } from '@stacks/transactions';

import { TEST_ACCOUNT_1_STX_ADDRESS } from './constants';

const emptyPrincipalNftBalancesResponse = {
  limit: 200,
  total: 0,
  cursor: { next: null, previous: null, current: null },
  results: [],
};

export async function mockMainnetTestAccountStacksNFTsRequest(page: Page | BrowserContext) {
  await page.route('**hiro.so/extended/v3/principals/*/balances/nft**', route =>
    route.fulfill({ json: emptyPrincipalNftBalancesResponse })
  );
  await page.route(
    `**/api.hiro.so/extended/v3/principals/${TEST_ACCOUNT_1_STX_ADDRESS}/balances/nft**`,
    route => route.fulfill({ json: emptyPrincipalNftBalancesResponse })
  );
}

export const MOCKED_COLLECTIBLES = {
  bnsV2Name: 'leather.btc',
  legacyBnsName: 'legacy.id',
  sip9Nft: 'Living Leather #1',
  unsupportedNft: 'Explorer #1',
};

const collectibleHoldings = [
  {
    contractId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2',
    assetName: 'BNS-V2',
    tokenId: 7,
    name: MOCKED_COLLECTIBLES.bnsV2Name,
  },
  {
    contractId: 'SP2XMGYYTA1KRBKBYJHTW8CFWB2QYZKZE4BMHG3PJ.living-leather',
    assetName: 'living-leather',
    tokenId: 1,
    name: MOCKED_COLLECTIBLES.sip9Nft,
  },
  {
    contractId: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild',
    assetName: 'The-Explorer-Guild',
    tokenId: 1,
    name: MOCKED_COLLECTIBLES.unsupportedNft,
  },
];

export async function mockTestAccountCollectibleHoldings(page: Page | BrowserContext) {
  await page.route(
    `**/api.hiro.so/extended/v3/principals/${TEST_ACCOUNT_1_STX_ADDRESS}/balances/nft**`,
    route =>
      route.fulfill({
        json: {
          limit: 200,
          total: collectibleHoldings.length + 1,
          cursor: { next: null, previous: null, current: null },
          results: [
            ...collectibleHoldings.map(holding => ({
              asset_identifier: `${holding.contractId}::${holding.assetName}`,
              value: { hex: cvToHex(Cl.uint(holding.tokenId)), repr: `u${holding.tokenId}` },
            })),
            {
              asset_identifier: 'SP000000000000000000002Q6VF78.bns::names',
              value: {
                hex: cvToHex(
                  Cl.tuple({
                    name: Cl.bufferFromAscii('legacy'),
                    namespace: Cl.bufferFromAscii('id'),
                  })
                ),
                repr: '(tuple (name 0x6c6567616379) (namespace 0x6964))',
              },
            },
          ],
        },
      })
  );
  await Promise.all(
    collectibleHoldings.map(holding =>
      page.route(`**/metadata/v1/nft/${holding.contractId}/${holding.tokenId}`, route =>
        route.fulfill({ json: { name: holding.name } })
      )
    )
  );
  await page.route('**/get-stacks-nft*', route => route.fulfill({ status: 404, json: {} }));
}
