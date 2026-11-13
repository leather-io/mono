const principalsMempoolTransactionsResp = {
  limit: 50,
  total: 0,
  cursor: { next: null, previous: null, current: null },
  results: [],
};

export const principalsMempoolTransactionsHandler = {
  path: 'https://api.hiro.so/extended/v3/principals/*/mempool/transactions',
  resp: principalsMempoolTransactionsResp,
  method: 'get',
} as const;
