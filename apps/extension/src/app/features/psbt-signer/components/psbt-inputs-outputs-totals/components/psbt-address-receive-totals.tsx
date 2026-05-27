import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { removeMinusSign } from '@app/common/utils';
import { usePsbtSignerContext } from '@app/features/psbt-signer/psbt-signer.context';
import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';

import { PsbtAddressTotalItem } from './psbt-address-total-item';

interface PsbtAddressTotalsProps {
  showNativeSegwitTotal: boolean;
  showTaprootTotal: boolean;
}
export function PsbtAddressReceiveTotals({
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
          subValue={removeMinusSign(
            formatCurrency(calculateBitcoinFiatValue(addressNativeSegwitTotal))
          )}
          value={removeMinusSign(formatCurrency(addressNativeSegwitTotal))}
        />
      ) : null}
      {showTaprootTotal ? (
        <PsbtAddressTotalItem
          hoverLabel={addressTaproot}
          subtitle={truncateMiddle(addressTaproot)}
          subValue={removeMinusSign(formatCurrency(calculateBitcoinFiatValue(addressTaprootTotal)))}
          value={removeMinusSign(formatCurrency(addressTaprootTotal))}
        />
      ) : null}
    </>
  );
}
