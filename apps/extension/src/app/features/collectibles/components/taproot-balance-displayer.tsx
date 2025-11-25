import { Link } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { useCurrentTaprootBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useRecoverUninscribedTaprootUtxosFeatureEnabled } from '@app/query/common/remote-config/remote-config.query';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

const taprootSpendNotSupportedYetMsg = `
  Total amount of BTC in your Taproot account addresses. Click to
  retrieve these funds.
`;

interface TaprootBalanceDisplayerProps {
  onSelectRetrieveBalance(): void;
}
export function TaprootBalanceDisplayer({ onSelectRetrieveBalance }: TaprootBalanceDisplayerProps) {
  const balance = useCurrentTaprootBtcBalanceWithFallback();
  const isRecoverFeatureEnabled = useRecoverUninscribedTaprootUtxosFeatureEnabled();
  if (!isRecoverFeatureEnabled) return null;
  if (balance.btc.availableBalance.amount.isLessThanOrEqualTo(0)) return null;
  return (
    <BasicTooltip label={taprootSpendNotSupportedYetMsg} asChild>
      <Link onClick={() => onSelectRetrieveBalance()} textStyle="caption.01" variant="text">
        {formatCurrency(balance.btc.availableBalance, { preset: 'pad-decimals' })}
      </Link>
    </BasicTooltip>
  );
}
