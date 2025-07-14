const nftResponse = { limit: 50, offset: 0, total: 0, results: [] };

export const nftHoldingsHandler = {
  path: 'https://api.hiro.so/extended/v1/tokens/nft/holdings',
  resp: nftResponse,
  method: 'get',
} as const;
