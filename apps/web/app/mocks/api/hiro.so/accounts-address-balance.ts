// https://api.mainnet.hiro.so/v2/accounts/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST?proof=0
export const resp = {
  stx: {
    balance: '0',
    total_miner_rewards_received: '0',
    lock_tx_id: '',
    locked: '0',
    lock_height: 0,
    burnchain_lock_height: 0,
    burnchain_unlock_height: 0,
    estimated_balance: '0',
    pending_balance_inbound: '0',
    pending_balance_outbound: '0',
    total_sent: '0',
    total_received: '0',
    total_fees_sent: '0',
  },
  fungible_tokens: {},
  non_fungible_tokens: {},
};

export const accountsBalanceHandler = {
  path: 'https://api.mainnet.hiro.so/extended/v1/address/SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST/balances',
  resp,
  method: 'get',
} as const;
