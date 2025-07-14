const resp = {
  mainnet: { target_block_time: 600 },
  testnet: { target_block_time: 120 },
};

export const blockTimesHandler = {
  path: 'https://api.mainnet.hiro.so/extended/v1/info/network_block_times',
  resp,
  method: 'get',
} as const;
