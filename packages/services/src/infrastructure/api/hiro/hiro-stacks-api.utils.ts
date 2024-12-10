import { HiroAddressBalanceResponse } from './hiro-stacks-api.client';

export function readStxTotalBalance(balances: HiroAddressBalanceResponse) {
  const totalBalance = Number(balances.stx.balance);
  return isNaN(totalBalance) ? 0 : totalBalance;
}

export function readStxLockedBalance(balances: HiroAddressBalanceResponse) {
  const lockedBalance = Number(balances.stx.locked);
  return isNaN(lockedBalance) ? 0 : lockedBalance;
}
