import { InfoSheet } from '@/features/swap/components/info-sheet/info-sheet';
import { t } from '@lingui/core/macro';

import { Text } from '@leather.io/ui/native';

export function PriceImpactInfoSheet() {
  return (
    <InfoSheet title={t`Price impact`}>
      <Text variant="body01">
        {t`The difference between the market price and the price you‘ll receive due to your trade size relative to the available liquidity. Larger trades typically have higher price impact.`}
      </Text>
    </InfoSheet>
  );
}
