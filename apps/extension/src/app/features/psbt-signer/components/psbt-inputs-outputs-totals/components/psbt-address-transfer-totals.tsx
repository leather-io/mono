import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { usePsbtSignerContext } from '@app/features/psbt-signer/psbt-signer.context';
import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';

import { PsbtAddressTotalItem } from './psbt-address-total-item';

interface PsbtAddressTotalsProps {
  showNativeSegwitTotal: boolean;
}
export function PsbtAddressTransferTotals({ showNativeSegwitTotal }: PsbtAddressTotalsProps) {
  const { addressNativeSegwit, addressNativeSegwitTotal } = usePsbtSignerContext();
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();

  if (!showNativeSegwitTotal) return null;

  return (
    <PsbtAddressTotalItem
      hoverLabel={addressNativeSegwit}
      subtitle={truncateMiddle(addressNativeSegwit)}
      subValue={formatCurrency(calculateBitcoinFiatValue(addressNativeSegwitTotal))}
      value={formatCurrency(addressNativeSegwitTotal)}
    />
  );
}
