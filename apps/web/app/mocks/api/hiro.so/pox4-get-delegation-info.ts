// https://api.mainnet.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-4/get-delegation-info
const resp = {
  okay: true,
  result: '0x09',
};

export const pox4GetDelegationInfo = {
  path: 'https://api.mainnet.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-4/get-delegation-info',
  resp,
  method: 'post',
} as const;
