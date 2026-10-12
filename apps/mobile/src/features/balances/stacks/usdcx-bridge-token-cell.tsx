import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { TokenCell } from '@/features/token/components/token-cell';
import { t } from '@lingui/core/macro';

import { STACKS_BRIDGE_URL, USDCX_SYMBOL } from '@leather.io/constants';
import { Button, Cell, Sip10AvatarIcon } from '@leather.io/ui/native';

interface UsdcxBridgeTokenCellProps {
  assetId: string;
  onPress?(): void;
}
export function UsdcxBridgeTokenCell({ assetId, onPress }: UsdcxBridgeTokenCellProps) {
  const { openUrl } = useOpenUrl();
  const [contractId = assetId] = assetId.split('::');

  return (
    <TokenCell
      icon={
        <Sip10AvatarIcon
          indicator="stacksIcon"
          contractId={contractId}
          imageCanonicalUri=""
          name={USDCX_SYMBOL}
        />
      }
      tokenName={USDCX_SYMBOL}
      ticker={USDCX_SYMBOL}
      onPress={onPress}
      asideComponent={
        <Cell.Aside>
          <Button variant="outline" onPress={() => openUrl(STACKS_BRIDGE_URL)}>{t`Bridge`}</Button>
        </Cell.Aside>
      }
    />
  );
}
