const resp = { okay: true, result: '0x070100000000000000000000000000000000' };

export const ststxTokenBalanceContractCallHandler = {
  path: 'https://api.hiro.so/v2/contracts/call-read/SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG/ststx-token/get-balance',
  resp,
  method: 'post',
} as const;
