import type { BrowserContext, Page } from '@playwright/test';

const mockedBitflowTokens = {
  tokens: [
    {
      'token-id': 'token-stx',
      tokenId: 'token-stx',
      icon: '',
      name: 'Stacks',
      symbol: 'STX',
      status: 'active',
      tokenContract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token',
      tokenDecimals: 6,
      tokenName: 'wstx',
      base: 'stx',
      type: 'native',
      isKeeperToken: false,
      bridge: 'FALSE',
      wrapTokens: null,
      layerOneAsset: null,
      priceData: { last_price: 0.85 },
    },
    {
      'token-id': 'token-usda',
      tokenId: 'token-usda',
      icon: '',
      name: 'Arkadiko USD Stablecoin',
      symbol: 'USDA',
      status: 'active',
      tokenContract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
      tokenDecimals: 6,
      tokenName: 'usda',
      base: 'stx',
      type: 'sip10',
      isKeeperToken: false,
      bridge: 'FALSE',
      wrapTokens: null,
      layerOneAsset: null,
      priceData: { last_price: 0.5 },
    },
    {
      'token-id': 'token-sbtc',
      tokenId: 'token-sbtc',
      icon: '',
      name: 'sBTC',
      symbol: 'sBTC',
      status: 'active',
      tokenContract: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
      tokenDecimals: 8,
      tokenName: 'sbtc-token',
      base: 'btc',
      type: 'sip10',
      isKeeperToken: false,
      bridge: 'FALSE',
      wrapTokens: null,
      layerOneAsset: null,
      priceData: { last_price: 45000 },
    },
  ],
  pools: [],
};

const mockedStxToUsdaRoutes = {
  'token-usda': [
    {
      dex_path: ['ARKADIKO'],
      postConditions: {
        '0': {
          dikoStx: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token',
          ignoreMinReceived: null,
          senderAddress: 'tx-sender',
          shareFeeContract: null,
          tokenContract: 'token-stx',
          tokenDecimals: 'token-stx',
          tokenName: 'token-stx',
        },
        '1': {
          dikoStx: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token',
          ignoreMinReceived: null,
          senderAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1',
          shareFeeContract: null,
          tokenContract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
          tokenDecimals: 6,
          tokenName: 'usda',
        },
      },
      quoteData: {
        contract: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.wrapper-arkadiko-v-1-2',
        function: 'get-dy',
        isKeeperRoute: false,
        parameters: {
          dx: null,
          dy: null,
          order: ['token-x', 'token-y', 'dy', 'provider'],
          provider: null,
          'token-x': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token',
          'token-y': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
        },
      },
      swapData: {
        contract: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.wrapper-arkadiko-v-1-2',
        function: 'swap-x-for-y',
        parameters: {
          dx: null,
          dy: null,
          'min-dx': null,
          'min-dy': null,
          order: ['token-x-trait', 'token-y-trait', 'dy', 'min-dx', 'provider'],
          provider: null,
          'token-x-trait': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token',
          'token-y-trait': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
        },
      },
      token_path: ['token-stx', 'token-usda'],
    },
  ],
};

// Simplified contract interface for the arkadiko wrapper
const mockedContractInterface = {
  functions: [
    {
      name: 'get-dy',
      access: 'read_only',
      args: [
        { name: 'token-x', type: 'trait_reference' },
        { name: 'token-y', type: 'trait_reference' },
        { name: 'dy', type: 'uint128' },
        { name: 'provider', type: { optional: 'principal' } },
      ],
      outputs: { type: { response: { ok: 'uint128', error: 'uint128' } } },
    },
    {
      name: 'swap-x-for-y',
      access: 'public',
      args: [
        { name: 'token-x-trait', type: 'trait_reference' },
        { name: 'token-y-trait', type: 'trait_reference' },
        { name: 'dy', type: 'uint128' },
        { name: 'min-dx', type: { optional: 'uint128' } },
        { name: 'provider', type: { optional: 'principal' } },
      ],
      outputs: { type: { response: { ok: 'uint128', error: 'uint128' } } },
    },
  ],
  variables: [],
  maps: [],
  fungible_tokens: [],
  non_fungible_tokens: [],
};

// Read-only call result returning a successful quote (0.5 USDA for 1 STX)
const mockedReadOnlyResult = {
  okay: true,
  result: '0x0100000000000000000000000000007a12',
};

const aeUsdcTokenContract = 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc';
const stxProviderTokenId = 'token-stx';

const mockedBitflowBffApiTokens = {
  tokens: [
    {
      contract_address: stxProviderTokenId,
      symbol: 'STX',
      name: 'Stacks',
      decimals: 6,
      asset_name: 'stx',
      image: '',
    },
    {
      contract_address: aeUsdcTokenContract,
      symbol: 'aeUSDC',
      name: 'Wrapped USDC',
      decimals: 6,
      asset_name: 'aeUSDC',
      image: '',
    },
  ],
};

const mockedBitflowBffApiPairs = {
  input_token: stxProviderTokenId,
  input_token_symbol: 'STX',
  input_token_name: 'Stacks',
  input_token_decimals: 6,
  input_token_image: '',
  pairs: [
    {
      output_token: aeUsdcTokenContract,
      output_token_symbol: 'aeUSDC',
      output_token_name: 'Wrapped USDC',
      output_token_decimals: 6,
      output_token_image: '',
    },
  ],
};

const mockedBitflowBffApiQuote = {
  success: true,
  amount_out: '500000',
  min_amount_out: '485000',
  slippage_tolerance: 300,
  route_path: [stxProviderTokenId, aeUsdcTokenContract],
  execution_path: [
    {
      pool_trait: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-pool',
      x_token_trait: stxProviderTokenId,
      y_token_trait: aeUsdcTokenContract,
      dex_type: 'ARKADIKO',
    },
  ],
  fee: '3000',
  price_impact_bps: 10,
  price_impact_tokens: '50',
};

const mockedBitflowBffApiSwap = {
  success: true,
  swap_contract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1',
  function_name: 'swap-x-for-y',
  swap_parameters: [
    {
      pool_trait: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-pool',
      x_token_trait: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token',
      y_token_trait: aeUsdcTokenContract,
      amount: '1000000',
      min_received: '485000',
      x_for_y: true,
      max_steps: 10,
    },
  ],
  post_conditions: [
    {
      amount: '1000000',
      sender_address: 'tx-sender',
      condition_code: 'less_than_or_equal_to',
      token_contract: '',
      token_decimals: 6,
      token_asset_name: '',
      post_condition_type: 'standard_stx',
    },
    {
      amount: '485000',
      sender_address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1',
      condition_code: 'greater_than_or_equal_to',
      token_contract: `${aeUsdcTokenContract}::aeUSDC`,
      token_decimals: 6,
      token_asset_name: 'aeUSDC',
      post_condition_type: 'contract_ft',
    },
  ],
};

export async function mockBitflowRequests(page: Page | BrowserContext) {
  await page.route('**/getAllTokensAndPools**', route =>
    route.fulfill({ json: mockedBitflowTokens })
  );

  await page.route('**/getAllRoutes**', route => route.fulfill({ json: mockedStxToUsdaRoutes }));

  await page.route('**/wvzrnmxqmi**/v2/contracts/interface/**', route =>
    route.fulfill({ json: mockedContractInterface })
  );

  await page.route('**/wvzrnmxqmi**/v2/contracts/call-read/**', route =>
    route.fulfill({ json: mockedReadOnlyResult })
  );

  await page.route('**/node.bitflowapis.finance/v2/contracts/interface/**', route =>
    route.fulfill({ json: mockedContractInterface })
  );

  await page.route('**/node.bitflowapis.finance/v2/contracts/call-read/**', route =>
    route.fulfill({ json: mockedReadOnlyResult })
  );

  await page.route('**/bff.bitflowapis.finance/api/quotes/v1/tokens**', route =>
    route.fulfill({ json: mockedBitflowBffApiTokens })
  );

  await page.route('**/bff.bitflowapis.finance/api/quotes/v1/pairs**', route =>
    route.fulfill({ json: mockedBitflowBffApiPairs })
  );

  await page.route('**/bff.bitflowapis.finance/api/quotes/v1/quote**', route =>
    route.fulfill({ json: mockedBitflowBffApiQuote })
  );

  await page.route('**/bff.bitflowapis.finance/api/quotes/v1/swap**', route =>
    route.fulfill({ json: mockedBitflowBffApiSwap })
  );
}
