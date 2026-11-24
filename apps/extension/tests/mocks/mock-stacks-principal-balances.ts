import type { BrowserContext, Page } from '@playwright/test';

import {
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_MULTISIG_ACCOUNTS_3_1_STX_ADDRESS,
  TEST_TESTNET_ACCOUNT_1_STX_ADDRESS,
} from './constants';

const fundedStxAddresses = [
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_TESTNET_ACCOUNT_1_STX_ADDRESS,
  TEST_MULTISIG_ACCOUNTS_3_1_STX_ADDRESS,
];

const emptyCursor = { next: null, previous: null, current: null };

const mockedEmptyFtBalances = {
  limit: 200,
  total: 0,
  cursor: emptyCursor,
  results: [],
};

const mockedEmptyStxBalance = {
  balance: '0',
  available: '0',
  locked: null,
  mempool: null,
};

const mockedFtBalances = {
  limit: 200,
  total: 9,
  cursor: emptyCursor,
  results: [
    {
      asset_identifier: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
      balance: '1888888000000',
    },
    {
      asset_identifier:
        'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
      balance: '114736',
    },
    {
      asset_identifier:
        'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-special-vote::special-vote',
      balance: '2579839300',
    },
    {
      asset_identifier: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope::NOT',
      balance: '10000',
    },
    {
      asset_identifier: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token::alex',
      balance: '2579839299',
    },
    {
      asset_identifier: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT.blockstack::BLOCKSTACK',
      balance: '60000000000',
    },
    {
      asset_identifier: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc',
      balance: '50000000',
    },
    {
      asset_identifier: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
      balance: '100000000',
    },
    {
      asset_identifier: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
      balance: '250000000',
    },
  ],
};

const mockedStxBalance = {
  balance: '13568037',
  available: '13568037',
  locked: null,
  mempool: null,
};

const ftBalancesUrl = '**hiro.so/extended/v3/principals/**/balances/ft**';
const stxBalanceUrl = '**hiro.so/extended/v3/principals/**/balances/stx';

export async function mockMainnetTestAccountStacksPrincipalBalancesRequest(
  page: Page | BrowserContext
) {
  await page.route(ftBalancesUrl, route =>
    route.fulfill({
      json: mockedFtBalances,
    })
  );

  await page.route(stxBalanceUrl, route => {
    const isFundedAccount = fundedStxAddresses.some(address =>
      route.request().url().includes(`/principals/${address}/`)
    );
    return route.fulfill({
      json: isFundedAccount ? mockedStxBalance : mockedEmptyStxBalance,
    });
  });
}

export async function mockEmptyStacksPrincipalBalancesRequest(page: Page | BrowserContext) {
  await page.unroute(ftBalancesUrl);
  await page.route(ftBalancesUrl, route =>
    route.fulfill({
      json: mockedEmptyFtBalances,
    })
  );

  await page.unroute(stxBalanceUrl);
  await page.route(stxBalanceUrl, route =>
    route.fulfill({
      json: mockedEmptyStxBalance,
    })
  );
}
