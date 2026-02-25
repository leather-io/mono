import type { TransactionFees } from '@leather.io/models';
import { createBitcoinRatesOnlyFees } from '@leather.io/utils';

import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';

interface SendInscriptionLoaderProps {
  children(data: { feeRates: TransactionFees }): React.JSX.Element;
}
export function SendInscriptionLoader({ children }: SendInscriptionLoaderProps) {
  const { data: rawFeeRates } = useBitcoinFeeRates();
  if (!rawFeeRates) return null;
  const feeRates = createBitcoinRatesOnlyFees(rawFeeRates);
  return children({ feeRates });
}
