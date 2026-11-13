const resp = {
  balance: '0',
  available: '0',
  locked: null,
  mempool: null,
};

export const principalsBalancesStxHandler = {
  path: 'https://api.mainnet.hiro.so/extended/v3/principals/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST/balances/stx',
  resp,
  method: 'get',
} as const;
