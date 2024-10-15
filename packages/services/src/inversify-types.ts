const TYPES = {
  // cache
  QueryClientService: Symbol.for('QueryClientService'),
  // settings
  NetworkSettingsService: Symbol.for('NetworkSettingsService'),
  // api clients
  BlockbookApiClient: Symbol.for('BlockbookApiClient'),
  MempoolSpaceApiClient: Symbol.for('MempoolSpaceApiClient'),
  // services
  AccountBalanceService: Symbol.for('AccountBalanceService'),
  BtcBalanceService: Symbol.for('BtcBalanceService'),
  StxBalanceService: Symbol.for('StxBalanceService'),
  UtxoSerivce: Symbol.for('UtxoSerivce'),
};

export { TYPES };
