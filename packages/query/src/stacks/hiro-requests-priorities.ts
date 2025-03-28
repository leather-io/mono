export const hiroApiRequestsPriorityLevels = {
  createWalletGaiaConfig: 15,
  makeAuthResponse: 15,

  getNetworkStatus: 10,
  getNamesOwnedByAddress: 9,

  getAddressBalance: 5,

  getAccountTransactionsWithTransfers: 4,

  getAccountNonces: 4,
  getNameInfo: 4,
  getNftHoldings: 4,
  getAddressMempoolTransactions: 4,
  getRawTransactionById: 4,
  getTransactionById: 4,
  getContractInterface: 4,

  getNetworkBlockTimes: 3,

  postFeeTransaction: 2,
  getFtMetadata: 2,
  getNftMetadata: 2,
  callReadOnlyFunction: 2,

  getStx20Balances: 1,
};
