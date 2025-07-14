const mempoolResp = { limit: 50, offset: 0, total: 0, results: [] };

export const mempoolHandler = {
  path: 'https://api.hiro.so/extended/v1/tx/mempool',
  resp: mempoolResp,
  method: 'get',
} as const;
