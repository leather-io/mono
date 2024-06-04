export interface Stx20Balance {
  ticker: string;
  balance: string;
  updateDate: string;
}

export interface Stx20BalanceResponse {
  address: string;
  balances: Stx20Balance[];
}
