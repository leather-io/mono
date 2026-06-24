import { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { useConfigSwapsEnabled } from '@app/query/common/remote-config/remote-config.query';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { SwapsDisabledTooltipLabel } from '../swaps-disabled-tooltip-label';
import { ActionButton } from './action-button';
import { FundButtons } from './fund-buttons';
import { TransferButtons } from './transfer-buttons';

interface SwapDisabledTooltipArgs {
  swapsEnabled: boolean;
  isTestnet: boolean;
  hasStacksAccount: boolean;
}

function getSwapDisabledTooltipLabel({
  swapsEnabled,
  isTestnet,
  hasStacksAccount,
}: SwapDisabledTooltipArgs): ReactNode {
  if (!swapsEnabled) return <SwapsDisabledTooltipLabel />;
  if (isTestnet) {
    return (
      <styled.span textStyle="caption.01">
        Swaps are only available on mainnet. Switch networks to swap.
      </styled.span>
    );
  }
  if (!hasStacksAccount) {
    return <styled.span textStyle="caption.01">Swaps require a Stacks account.</styled.span>;
  }
  return null;
}

export function AccountActions() {
  const navigate = useNavigate();
  const stacksAccount = useCurrentStacksAccount();
  const { isTestnet } = useCurrentNetworkState();

  const swapsEnabled = useConfigSwapsEnabled();
  const swapsBtnDisabled = !swapsEnabled || !stacksAccount || isTestnet;
  const swapDisabledTooltipLabel = getSwapDisabledTooltipLabel({
    swapsEnabled,
    isTestnet,
    hasStacksAccount: !!stacksAccount,
  });
  function navigateToDefaultSwapRoute() {
    return navigate(
      replaceRouteParams(RouteUrls.Swap, {
        base: 'STX',
        quote: '',
      }).replace('{chain}', 'stacks')
    );
  }

  return (
    <Flex gap={['space.01', 'space.04']} overflowX="scroll">
      <FundButtons />
      <TransferButtons />

      <BasicTooltip label={swapDisabledTooltipLabel} side="left" asChild>
        <styled.span
          display="flex"
          flexGrow={1}
          cursor={swapsBtnDisabled ? 'not-allowed' : undefined}
          tabIndex={swapsBtnDisabled ? 0 : undefined}
          aria-disabled={swapsBtnDisabled || undefined}
        >
          <ActionButton
            data-testid={HomePageSelectors.SwapBtn}
            disabled={swapsBtnDisabled}
            onClick={navigateToDefaultSwapRoute}
            variant="outline"
            pointerEvents={swapsBtnDisabled ? 'none' : undefined}
          >
            Swap
          </ActionButton>
        </styled.span>
      </BasicTooltip>
    </Flex>
  );
}
