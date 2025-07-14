// https://api.mainnet.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-4/get-stacker-info
export const poxGetStackerInfo = {
  okay: true,
  result: '0x09',
  yoTesting: 'msw mock request',
};

export const poxGetStackerInfoHandler = {
  path: 'https://api.mainnet.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-4/get-stacker-info',
  resp: poxGetStackerInfo,
  method: 'post',
} as const;
