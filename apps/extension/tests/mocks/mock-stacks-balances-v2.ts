import type { BrowserContext, Page } from '@playwright/test';

import { TEST_ACCOUNT_1_STX_ADDRESS, TEST_TESTNET_ACCOUNT_1_STX_ADDRESS } from './constants';

const fundedStxAddresses = [TEST_ACCOUNT_1_STX_ADDRESS, TEST_TESTNET_ACCOUNT_1_STX_ADDRESS];

const mockedEmptyFtBalancesV2 = {
  limit: 100,
  offset: 0,
  total: 0,
  results: [],
};

const mockedEmptyStxBalanceV2 = {
  balance: '0',
  total_miner_rewards_received: '0',
  lock_tx_id: '',
  locked: '0',
  lock_height: 0,
  burnchain_lock_height: 0,
  burnchain_unlock_height: 0,
};

const mockedFtBalancesV2 = {
  limit: 100,
  offset: 0,
  total: 9,
  results: [
    {
      token: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
      balance: '1888888000000',
    },
    {
      token: 'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
      balance: '114736',
    },
    {
      token: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-special-vote::special-vote',
      balance: '2579839300',
    },
    {
      token: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope::NOT',
      balance: '10000',
    },
    {
      token: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token::alex',
      balance: '2579839299',
    },
    {
      token: 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT.blockstack::BLOCKSTACK',
      balance: '60000000000',
    },
    {
      token: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc',
      balance: '50000000',
    },
    {
      token: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
      balance: '100000000',
    },
    {
      token: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
      balance: '250000000',
    },
  ],
};

const mockedStxBalanceV2 = {
  balance: '13568037',
  total_miner_rewards_received: '0',
  lock_tx_id: '',
  locked: '0',
  lock_height: 0,
  burnchain_lock_height: 0,
  burnchain_unlock_height: 0,
};

export async function mockMainnetTestAccountStacksBalancesV2Request(page: Page | BrowserContext) {
  await page.route('**hiro.so/extended/v2/addresses/**/balances/ft', route =>
    route.fulfill({
      json: mockedFtBalancesV2,
    })
  );

  await page.route('**hiro.so/extended/v2/addresses/**/balances/stx', route => {
    const isFundedAccount = fundedStxAddresses.some(address =>
      route.request().url().includes(`/addresses/${address}/`)
    );
    return route.fulfill({
      json: isFundedAccount ? mockedStxBalanceV2 : mockedEmptyStxBalanceV2,
    });
  });
}

export async function mockEmptyStacksBalancesV2Request(page: Page | BrowserContext) {
  await page.unroute('**hiro.so/extended/v2/addresses/**/balances/ft');
  await page.route('**hiro.so/extended/v2/addresses/**/balances/ft', route =>
    route.fulfill({
      json: mockedEmptyFtBalancesV2,
    })
  );

  await page.unroute('**hiro.so/extended/v2/addresses/**/balances/stx');
  await page.route('**hiro.so/extended/v2/addresses/**/balances/stx', route =>
    route.fulfill({
      json: mockedEmptyStxBalanceV2,
    })
  );
}
