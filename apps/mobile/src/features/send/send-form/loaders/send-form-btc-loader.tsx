import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useBitcoinAccountUtxos,
} from '@/queries/balance/bitcoin-balance.query';
import BigNumber from 'bignumber.js';

import { AverageBitcoinFeeRates, Money } from '@leather.io/models';
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
  const { data: feeRates } = useAverageBitcoinFeeRates();
  const { data: utxos = [] } = useBitcoinAccountUtxos(accountId);
  const { availableBalance, fiatBalance } = useBitcoinAccountTotalBitcoinBalance(accountId);

  // Handle loading and error states
  // if (!utxos.length || !feeRates) return null;

  const bigZero = new BigNumber(0);
  const zeroFees = {
    fastestFee: bigZero,
    halfHourFee: bigZero,
    hourFee: bigZero,
  };

  return children({
    availableBalance,
    fiatBalance,
    feeRates: feeRates || zeroFees,
    utxos,
  });
}
