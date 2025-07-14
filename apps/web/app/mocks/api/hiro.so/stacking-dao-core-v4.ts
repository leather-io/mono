const resp = { okay: true, result: '0x0100000000000000000000000000000000' };

export const stackingDaoContractCallHandler = {
  path: 'https://api.hiro.so/v2/contracts/call-read/SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG/stacking-dao-core-v4/get-stack-fee',
  resp,
  method: 'post',
} as const;
