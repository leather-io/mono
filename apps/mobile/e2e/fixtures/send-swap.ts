const aeUsdcTokenContract = 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc';
const stxProviderTokenId = 'token-stx';

export const swapBffTokens = {
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

export const swapBffPairs = {
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

export const swapBffQuote = {
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
      expected_bin_id: 0,
      function_name: 'swap-x-for-y',
      dex_type: 'ARKADIKO',
    },
  ],
  fee: '3000',
  price_impact_bps: 10,
  price_impact_tokens: '50',
};

export const swapBffSwap = {
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
