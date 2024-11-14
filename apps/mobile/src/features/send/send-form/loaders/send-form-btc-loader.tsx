import { AccountId } from '@/models/domain.model';
import { useBitcoinAccountTotalBitcoinBalance } from '@/queries/balance/bitcoin-balance.query';
import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';
import { useAverageBitcoinFeeRates } from '@leather.io/query';

interface SendFormBtcData {
  availableBalance: Money;
  fiatBalance: Money;
  feeRates: Record<string, BigNumber>;
}

interface SendFormBtcLoaderProps {
  account: AccountId;
  children({ availableBalance, fiatBalance, feeRates }: SendFormBtcData): React.ReactNode;
}
export function SendFormBtcLoader({ account, children }: SendFormBtcLoaderProps) {
  // Not sure if we need to load feeRates here?
  const { data: feeRates } = useAverageBitcoinFeeRates();
  const { availableBalance, fiatBalance } = useBitcoinAccountTotalBitcoinBalance({
    accountIndex: account.accountIndex,
    fingerprint: account.fingerprint,
  });

  if (!feeRates) return null;

  return children({ availableBalance, fiatBalance, feeRates });
}
