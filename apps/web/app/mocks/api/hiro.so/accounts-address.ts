// https://api.mainnet.hiro.so/v2/accounts/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST?proof=0
export const resp = {
  balance: '0x00000000000000000000000000000000',
  locked: '0x00000000000000000000000000000000',
  unlock_height: 0,
  nonce: 0,
};

export const accountsHandler = {
  path: 'https://api.mainnet.hiro.so/v2/accounts/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST',
  resp,
  method: 'get',
} as const;
