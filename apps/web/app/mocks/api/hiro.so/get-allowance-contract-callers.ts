const resp = {
  okay: true,
  result: '0x09',
};

export const getAllowanceContractCallersHandlers = {
  path: 'https://api.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-4/get-allowance-contract-callers',
  resp,
  method: 'post',
} as const;
