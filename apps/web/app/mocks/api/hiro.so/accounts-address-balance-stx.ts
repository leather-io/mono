const resp = {
  balance: '0',
  total_miner_rewards_received: '0',
  lock_tx_id: '',
  locked: '0',
  lock_height: 0,
  burnchain_lock_height: 0,
  burnchain_unlock_height: 0,
};

export const accountsBalanceStxHandler = {
  path: 'https://api.hiro.so/extended/v2/addresses/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST/balances/stx',
  resp,
  method: 'get',
} as const;
