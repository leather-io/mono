/**
 * These values are used as the first item in some query keys, allowing the
 * queries they are used in to be read from any part of the app.
 */
export enum BitcoinQueryPrefixes {
  GetInscriptionTextContent = 'get-inscription-text-content',
  GetTransactionsByAddress = 'get-transactions-by-address',
  GetInscriptionsByAddress = 'get-inscriptions-by-address',
  GetInscription = 'get-inscription',
  GetStampsByAddress = 'get-stamps-by-address',
  GetBrc20Tokens = 'get-brc20-tokens',
  GetBitcoinFeeEstimates = 'bitcoin-fee-estimates',
  GetInscriptionsByParam = 'get-inscriptions-by-param',
  GetRunesOutputsByAddress = 'get-runes-outputs-by-address',
  GetRunesTickerInfo = 'get-runes-ticker-info',
  GetRunesWalletBalances = 'get-runes-wallet-balances',
}

export enum StacksQueryPrefixes {
  GetNftMetadata = 'get-nft-metadata',
  GetNftHoldings = 'get-nft-holdings',
  GetFtMetadata = 'get-ft-metadata',
  GetRawTransactionById = 'get-raw-transaction-by-id',
  GetTransactionById = 'get-transaction-by-id',
  GetAccountTxsWithTransfers = 'get-account-txs-with-transfers',
  GetAccountNonces = 'get-account-nonces',
  GetNetworkStatus = 'get-network-status',
  GetAddressMempoolTransactions = 'get-address-mempool-transactions',
  GetNetworkBlockTime = 'get-network-block-time',
  PostFeeTransaction = 'post-fee-transaction',
  GetContractInterface = 'get-contract-interface',
  GetStxAddressBalance = 'get-stx-address-balance',
  GetSip10AddressBalances = 'get-sip10-address-balances',
}

export enum BnsV2QueryPrefixes {
  GetBnsNamesByAddress = 'get-bns-names-by-address',
  GetBnsV2ZoneFileData = 'get-bns-v2-zone-file-data',
}

export enum StackingQueryPrefixes {
  GetAllowanceContractCallers = 'get-allowance-contract-callers',
  GetCycleDuration = 'get-cycle-duration',
  GetStatus = 'get-status',
  GetPoxOperationInfo = 'get-pox-operation-info',
  GetCoreInfo = 'get-core-info',
  GetSecondsUntilNextCycle = 'get-seconds-until-next-cycle',
  GetPoxInfo = 'get-pox-info',
  GetAccountExtendedBalances = 'get-account-extended-balances',
}
