import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import BigNumber from 'bignumber.js';

import { AccountId, AverageBitcoinFeeRates, Money } from '@leather.io/models';
import { Utxo, useAverageBitcoinFeeRates } from '@leather.io/query';

interface SendFormBtcData {
  availableBalance: Money;
  fiatBalance: Money;
  feeRates: AverageBitcoinFeeRates;
  utxos: Utxo[];
}

interface SendFormBtcLoaderProps {
  account: AccountId;
  children({ availableBalance, fiatBalance, feeRates, utxos }: SendFormBtcData): React.ReactNode;
}
export function SendFormBtcLoader({ account, children }: SendFormBtcLoaderProps) {
  const accountId = { fingerprint: account.fingerprint, accountIndex: account.accountIndex };
  const { data: feeRates, isLoading: isFeeRatesLoading } = useAverageBitcoinFeeRates();
  const accountUtxos = useAccountUtxos(accountId.fingerprint, accountId.accountIndex);
  const btcBalance = useBtcAccountBalance(accountId.fingerprint, accountId.accountIndex);

  // TODO LEA-1726: Handle loading and error states
  if (btcBalance.state !== 'success' || accountUtxos.state !== 'success' || isFeeRatesLoading)
    return null;

  const bigZero = new BigNumber(0);
  const zeroFees = {
    fastestFee: bigZero,
    halfHourFee: bigZero,
    hourFee: bigZero,
  };

  return children({
    availableBalance: btcBalance.value.btc.availableBalance,
    fiatBalance: btcBalance.value.fiat.availableBalance,
    feeRates: feeRates || zeroFees,
    utxos: accountUtxos.value.available,
  });
}
