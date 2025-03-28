/**
 * These values are used as the first item in some query keys, allowing the
 * queries they are used in to be read from any part of the app.
 */
export enum BitcoinQueryPrefixes {
  GetInscriptionTextContent = 'get-inscription-text-content',
  GetTransactionsByAddress = 'get-transactions-by-address',
  GetTaprootUtxosByAddress = 'get-taproot-utxos-by-address',
  GetInscriptionsByAddress = 'get-inscriptions-by-address',
  GetInscription = 'get-inscription',
  GetInscriptions = 'get-inscriptions',
  GetStampsByAddress = 'get-stamps-by-address',
  GetBrc20Tokens = 'get-brc20-tokens',
  GetUtxosByAddress = 'get-utxos-by-address',
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
  GetStx20Balances = 'get-stx20-balances',
  GetAccountNonces = 'get-account-nonces',
  GetNetworkStatus = 'get-network-status',
  GetAddressMempoolTransactions = 'get-address-mempool-transactions',
  GetNetworkBlockTime = 'get-network-block-time',
  PostFeeTransaction = 'post-fee-transaction',
  GetContractInterface = 'get-contract-interface',
  GetAccountBalance = 'get-account-balance',
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
}
