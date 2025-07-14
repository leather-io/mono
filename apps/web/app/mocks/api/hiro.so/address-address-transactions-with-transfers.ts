const transactionWithTransfersResp = { limit: 50, offset: 0, total: 0, results: [] };

export const transactionWithTransfersHandler = {
  path: 'https://api.hiro.so/extended/v1/address/*/transactions_with_transfers',
  resp: transactionWithTransfersResp,
  method: 'get',
} as const;
