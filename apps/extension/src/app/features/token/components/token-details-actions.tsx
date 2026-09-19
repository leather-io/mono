import { useLocation, useNavigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { useSwapAvailability } from '@app/common/hooks/use-swap-availability';
import type { ReceiveView } from '@app/common/receive/receive';
import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { DetailsPillButton } from '@app/components/details/details-pill-button';
import { useFlags } from '@app/features/feature-flags';

export type SwapChain = 'bitcoin' | 'stacks';

interface TokenDetailsActionsRowProps {
  symbol: string;
  receiveView: ReceiveView;
  swapChain: SwapChain;
  isBuyEnabled?: boolean;
  isSwapEnabled?: boolean;
}

export function TokenDetailsActionsRow({
  symbol,
  receiveView,
  swapChain,
  isBuyEnabled = true,
  isSwapEnabled = true,
}: TokenDetailsActionsRowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showReceive } = useReceiveDialog();
  const { releaseOnramperBuy } = useFlags();
  const swapAvailability = useSwapAvailability();

  function pageModeRoutingAction(url: string) {
    return whenPageMode({
      full() {
        void navigate(url);
      },
      popup() {
        void openIndexPageInNewTab(url);
      },
    })();
  }

  return (
    <Flex
      gap="space.02"
      alignItems="center"
      justifyContent="center"
      flexWrap="nowrap"
      px="space.05"
      py="space.01"
      width="100%"
      maxWidth="390px"
      margin="0 auto"
    >
      <DetailsPillButton
        label="Send"
        onClick={() =>
          void navigate(RouteUrls.SendCryptoAsset, { state: { backgroundLocation: location } })
        }
        testId="token-details-send-btn"
      />
      <DetailsPillButton
        label="Receive"
        onClick={() => showReceive(receiveView)}
        testId="token-details-receive-btn"
      />
      {releaseOnramperBuy && (
        <DetailsPillButton
          label="Buy"
          disabled={!isBuyEnabled}
          onClick={() => pageModeRoutingAction(RouteUrls.Fund)}
          testId="token-details-buy-btn"
        />
      )}
      <DetailsPillButton
        label="Swap"
        disabled={!isSwapEnabled || !swapAvailability.isEnabled}
        onClick={() =>
          void navigate(
            replaceRouteParams(RouteUrls.Swap, { base: symbol, quote: '' }).replace(
              '{chain}',
              swapChain
            )
          )
        }
        testId="token-details-swap-btn"
      />
    </Flex>
  );
}
