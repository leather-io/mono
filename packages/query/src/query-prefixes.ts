/**
 * These values are used as the first item in some query keys, allowing the
 * queries they are used in to be read from any part of the app.
 */
export enum BitcoinQueryPrefixes {
  Brc20TokenBalance = 'brc20-token-balance',
  OrdinalTextContent = 'ordinal-text-content',
  TaprootAddressUtxos = 'taproot-address-utxos',
  InscriptionsByAddress = 'inscriptions-by-address',
  InscriptionMetadata = 'inscription-metadata',
  GetInscriptions = 'get-inscriptions',
  StampCollection = 'stamp-collection',
  StampsByAddress = 'stamps-by-address',
  GetBrc20Tokens = 'get-brc20-tokens',
}

export enum StacksQueryPrefixes {
  GetBnsNamesByAddress = 'get-bns-names-by-address',
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
}
