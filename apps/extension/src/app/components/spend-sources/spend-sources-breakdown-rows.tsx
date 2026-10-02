import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import type { SpendSourcesSummary } from '@leather.io/bitcoin';

import { formatCurrency } from '@app/common/currency-formatter';
import { InfoCardRow } from '@app/components/info-card/info-card';

interface SpendSourcesBreakdownRowsProps {
  summary: SpendSourcesSummary;
}

export function SpendSourcesBreakdownRows({ summary }: SpendSourcesBreakdownRowsProps) {
  const spendsFromMultipleTypes =
    summary.nativeSegwitInputCount > 0 && summary.taprootInputCount > 0;
  if (!spendsFromMultipleTypes) return null;

  return (
    <>
      <InfoCardRow
        title="Native SegWit"
        value={formatCurrency(summary.nativeSegwit, { preset: 'pad-decimals' })}
        data-testid={SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow}
      />
      <InfoCardRow
        title="Taproot"
        value={formatCurrency(summary.taproot, { preset: 'pad-decimals' })}
        data-testid={SendCryptoAssetSelectors.SpendSourcesTaprootRow}
      />
    </>
  );
}
