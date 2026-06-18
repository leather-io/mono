import type { BrowserContext, Page } from '@playwright/test';

import { TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS } from './constants';

const mockedSip10TokenMap = {
  'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin': {
    assetIdentifier: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
    name: 'LONGcoin',
    symbol: 'LONG',
    decimals: 6,
    image: 'https://storage.googleapis.com/longcoin/LONGcoin-image.png',
    principal: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin',
  },
  'SP000000000000000000002Q6VF78.leather-integration-tests': {
    assetIdentifier: 'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
    name: 'Leather test token',
    symbol: 'LTT',
    decimals: 6,
    image:
      'https://images.leather.io/tokens/SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx.svg',
    principal: 'SP000000000000000000002Q6VF78.leather-integration-tests',
  },
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token': {
    assetIdentifier: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc',
    name: 'sBTC',
    symbol: 'sBTC',
    decimals: 8,
    image: 'https://images.leather.io/tokens/sbtc.svg',
    principal: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  },
  'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc': {
    assetIdentifier: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
    name: 'Wrapped USDC',
    symbol: 'aeUSDC',
    decimals: 6,
    image: 'https://images.leather.io/tokens/usdc.svg',
    principal: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
  },
  'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx': {
    assetIdentifier: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
    name: 'USDCx',
    symbol: 'USDCx',
    decimals: 6,
    image: 'https://images.leather.io/tokens/usdcx.svg',
    principal: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx',
  },
};

const mockedSip10PriceMap = {
  'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin': {
    price: 4.23105713004e-7,
    change24h: 0,
    priceChange: { '1d': 0 },
  },
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token': {
    price: 45000,
    change24h: 2.5,
    priceChange: { '1d': 2.5 },
  },
  'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc': {
    price: 1.0,
    change24h: 0.01,
    priceChange: { '1d': 0.01 },
  },
  'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx': {
    price: 1.0,
    change24h: 0.02,
    priceChange: { '1d': 0.02 },
  },
};

const mockedSip10AnalyticsMap = {
  'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin': {
    trendingScore: 85,
    trustScore: 70,
    distributionScore: 60,
    holderCount: 5000,
    circulatingSupply: 1000000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token': {
    trendingScore: 92,
    trustScore: 95,
    distributionScore: 80,
    holderCount: 25000,
    circulatingSupply: 5000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc': {
    trendingScore: 5,
    trustScore: 90,
    distributionScore: 75,
    holderCount: 15000,
    circulatingSupply: 50000000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx': {
    trendingScore: 3,
    trustScore: 85,
    distributionScore: 70,
    holderCount: 10000,
    circulatingSupply: 30000000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

export async function mockEmptyLeatherApiUtxosRequest(page: Page | BrowserContext) {
  await page.route('**/v1/utxos/**', route =>
    route.fulfill({
      json: [],
    })
  );
}

export async function mockLeatherApiRequests(page: Page | BrowserContext) {
  await page.route('**/v1/market/bitcoin/fees**', route =>
    route.fulfill({
      json: {
        low: { rate: 1 },
        standard: { rate: 5 },
        high: { rate: 10 },
      },
    })
  );

  await page.route('**/v1/tokens/sip10s?format=map', route =>
    route.fulfill({
      json: {
        format: 'map',
        data: mockedSip10TokenMap,
      },
    })
  );

  await page.route(
    '**/v1/tokens/sip10s/SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin',
    route =>
      route.fulfill({
        json: mockedSip10TokenMap['SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin'],
      })
  );

  await page.route(
    '**/v1/tokens/sip10s/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    route =>
      route.fulfill({
        json: mockedSip10TokenMap['SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'],
      })
  );

  await page.route(
    '**/v1/tokens/sip10s/SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    route =>
      route.fulfill({
        json: mockedSip10TokenMap['SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc'],
      })
  );

  await page.route('**/v1/tokens/sip10s/SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx', route =>
    route.fulfill({
      json: mockedSip10TokenMap['SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx'],
    })
  );

  await page.route('**/v1/market/prices/sip10s?format=map', route =>
    route.fulfill({
      json: {
        format: 'map',
        data: mockedSip10PriceMap,
      },
    })
  );

  await page.route('**/v1/analytics/sip10s?format=map', route =>
    route.fulfill({
      json: {
        format: 'map',
        data: mockedSip10AnalyticsMap,
      },
    })
  );

  await page.route('**/v1/market/fiat-rates', route =>
    route.fulfill({
      json: {
        rates: {
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.0,
        },
      },
    })
  );

  await page.route('**/v1/market/prices/native?format=map', route =>
    route.fulfill({
      json: {
        format: 'map',
        data: {
          BTC: { price: 45000, change24h: 2.5 },
          STX: { price: 0.85, change24h: -1.2 },
        },
      },
    })
  );

  await page.route('**/v1/utxos/**', route =>
    route.fulfill({
      json: [
        {
          txid: 'b7f3c61e89524a1d7f8e0b2c3d4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a',
          vout: 0,
          value: '300000',
          height: 98330,
          address: TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
          path: "m/86'/1'/0'/0/0",
        },
        {
          txid: 'a8e2a50d68479d233ce3cd31cdca04160f003ca6ac49149070b6ade627553e80',
          vout: 1,
          value: '200000',
          height: 98330,
          address: 'tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d',
          path: "m/84'/1'/0'/0/0",
        },
      ],
    })
  );

  await page.route('**/v1/transactions/**', route =>
    route.fulfill({
      json: {
        meta: {
          page: 1,
          pageSize: 1,
          totalPages: 1,
          totalItems: 1,
        },
        data: [
          {
            txid: 'a8e2a50d68479d233ce3cd31cdca04160f003ca6ac49149070b6ade627553e80',
            height: 98330,
            time: 1755767769,
            vin: [
              {
                txid: '54ac9fde41f25591f18fa3075f8f084d8c59f71cc1a817fbf39c779a7255529b',
                n: 1,
                address: 'tb1q4fvs5cm7qjgw8qa0fr548ewwxhl5htkydv7ssm',
                value: '337677',
              },
              {
                txid: '5e5fc7f548ca4d7083030f30052e29618b4b5a625521f194eb5962ebdf32ce15',
                n: 1,
                address: 'tb1q4fvs5cm7qjgw8qa0fr548ewwxhl5htkydv7ssm',
                value: '1616428',
              },
              {
                txid: 'c535a536a3679bf4c09ef00257902cf31df2166a9d0ed7d8df27f6e7bc10c4a9',
                n: 1,
                address: 'tb1q4fvs5cm7qjgw8qa0fr548ewwxhl5htkydv7ssm',
                value: '24783',
              },
            ],
            vout: [
              {
                n: 0,
                address: 'tb1q4d2cn30fkvkamtgthyvtzgd6909mwy4mugtsgk',
                value: '1778612',
              },
              {
                n: 1,
                owned: true,
                address: 'tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d',
                path: "m/84'/1'/0'/0/0",
                value: '200000',
              },
            ],
          },
        ],
      },
    })
  );

  await page.route('**/v1/defi/bitflow/pools**', route =>
    route.fulfill({
      json: {
        format: 'map',
        data: {},
      },
    })
  );

  await page.route('**/v1/app-config', route =>
    route.fulfill({
      json: {
        assets: {
          defaultEnabled: [
            'sip10|SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
            'sip10|SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token',
            'sip10|SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc',
            'sip10|SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
            'sip10|SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
          ],
        },
        fees: {
          stacks: {
            minimumRelayFeeRate: 1,
            globalMaximumFee: 5000000,
            transfers: {
              low: { minimum: 180, default: 240, maximum: 299 },
              standard: { minimum: 300, default: 400, maximum: 800 },
              high: { minimum: 801, default: 901, maximum: 1001 },
            },
            contractCalls: {
              low: { minimum: 500, default: 1750, maximum: 2999 },
              standard: { minimum: 3000, default: 3750, maximum: 10000 },
              high: { minimum: 10001, default: 50001, maximum: 1000001 },
            },
            contractDeployments: {
              low: { minimum: 10000, default: 30000, maximum: 50000 },
              standard: { minimum: 50001, default: 100002, maximum: 500000 },
              high: { minimum: 1000001, default: 1500000, maximum: 2000001 },
            },
            sipTokenSends: {
              low: { minimum: 500, default: 600, maximum: 700 },
              standard: { minimum: 701, default: 1751, maximum: 4000 },
              high: { minimum: 4001, default: 4002, maximum: 10001 },
            },
          },
        },
      },
    })
  );
}
