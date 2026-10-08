import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import type { SpendSourcesBreakdown } from '@leather.io/bitcoin';

import { formatCurrency } from '@app/common/currency-formatter';
import { InfoCardRow } from '@app/components/info-card/info-card';

interface SpendSourcesBreakdownRowsProps {
  breakdown: SpendSourcesBreakdown;
}

export function SpendSourcesBreakdownRows({ breakdown }: SpendSourcesBreakdownRowsProps) {
  return (
    <>
      <InfoCardRow
        title="Native SegWit"
        value={formatCurrency(breakdown.nativeSegwit, { preset: 'pad-decimals' })}
        data-testid={SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow}
      />
      <InfoCardRow
        title="Taproot"
        value={formatCurrency(breakdown.taproot, { preset: 'pad-decimals' })}
        data-testid={SendCryptoAssetSelectors.SpendSourcesTaprootRow}
      />
    </>
  );
}
