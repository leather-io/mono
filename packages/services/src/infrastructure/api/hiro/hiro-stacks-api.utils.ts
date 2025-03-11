import {
  HiroAddressBalanceResponse,
  HiroAddressTransactionWithTransfers,
} from './hiro-stacks-api.client';

export function readStxTotalBalance(balances: HiroAddressBalanceResponse) {
  const totalBalance = Number(balances.stx.balance);
  return isNaN(totalBalance) ? 0 : totalBalance;
}

export function readStxLockedBalance(balances: HiroAddressBalanceResponse) {
  const lockedBalance = Number(balances.stx.locked);
  return isNaN(lockedBalance) ? 0 : lockedBalance;
}

export function filterVerboseUnusedTransactionWithTransfersData(
  data: HiroAddressTransactionWithTransfers
) {
  if (data.tx.tx_type === 'smart_contract')
    data.tx.smart_contract = { ...data.tx.smart_contract, source_code: 'redacted' };

  if (data.tx.tx_type === 'contract_call' && data.tx.contract_call.function_args) {
    data.tx.contract_call.function_args = data.tx.contract_call.function_args.map(fnArgs => ({
      ...fnArgs,
      hex: 'redacted',
      repr: 'redacted',
    }));
    data.tx.tx_result = { ...data.tx.tx_result, hex: 'redacted', repr: 'redacted' };
  }
  return data;
}
