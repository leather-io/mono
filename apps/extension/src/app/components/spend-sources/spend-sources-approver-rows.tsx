import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import type { SpendSourcesBreakdown } from '@leather.io/bitcoin';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

interface SpendSourcesApproverRowProps {
  title: string;
  value: Money;
  'data-testid': string;
}

function SpendSourcesApproverRow({ title, value, ...props }: SpendSourcesApproverRowProps) {
  return (
    <Flex justifyContent="space-between" gap="space.03" {...props}>
      <styled.span textStyle="caption.01">{title}</styled.span>
      <styled.span textStyle="caption.01">
        {formatCurrency(value, { preset: 'pad-decimals' })}
      </styled.span>
    </Flex>
  );
}

interface SpendSourcesApproverRowsProps {
  breakdown: SpendSourcesBreakdown;
}

export function SpendSourcesApproverRows({ breakdown }: SpendSourcesApproverRowsProps) {
  return (
    <Stack gap="space.01" mb="space.03">
      <SpendSourcesApproverRow
        title="Native SegWit"
        value={breakdown.nativeSegwit}
        data-testid={SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow}
      />
      <SpendSourcesApproverRow
        title="Taproot"
        value={breakdown.taproot}
        data-testid={SendCryptoAssetSelectors.SpendSourcesTaprootRow}
      />
    </Stack>
  );
}
