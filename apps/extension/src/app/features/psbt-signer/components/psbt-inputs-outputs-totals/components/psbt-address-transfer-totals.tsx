import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { usePsbtSignerContext } from '@app/features/psbt-signer/psbt-signer.context';
import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';

import { PsbtAddressTotalItem } from './psbt-address-total-item';

interface PsbtAddressTotalsProps {
  showNativeSegwitTotal: boolean;
  showTaprootTotal: boolean;
}
export function PsbtAddressTransferTotals({
  showNativeSegwitTotal,
  showTaprootTotal,
}: PsbtAddressTotalsProps) {
  const { addressNativeSegwit, addressNativeSegwitTotal, addressTaproot, addressTaprootTotal } =
    usePsbtSignerContext();
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();

  return (
    <>
      {showNativeSegwitTotal ? (
        <PsbtAddressTotalItem
          hoverLabel={addressNativeSegwit}
          subtitle={truncateMiddle(addressNativeSegwit)}
          subValue={formatCurrency(calculateBitcoinFiatValue(addressNativeSegwitTotal))}
          value={formatCurrency(addressNativeSegwitTotal)}
        />
      ) : null}
      {showTaprootTotal ? (
        <PsbtAddressTotalItem
          hoverLabel={addressTaproot}
          subtitle={truncateMiddle(addressTaproot)}
          subValue={formatCurrency(calculateBitcoinFiatValue(addressTaprootTotal))}
          value={formatCurrency(addressTaprootTotal)}
        />
      ) : null}
    </>
  );
}
