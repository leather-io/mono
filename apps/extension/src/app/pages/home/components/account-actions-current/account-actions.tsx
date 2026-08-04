import { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import {
  type SwapAvailability,
  useSwapAvailability,
} from '@app/common/hooks/use-swap-availability';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { SwapsDisabledTooltipLabel } from '../swaps-disabled-tooltip-label';
import { ActionButton } from './action-button';
import { FundButtons } from './fund-buttons';
import { TransferButtons } from './transfer-buttons';

function getSwapDisabledTooltipLabel(swapAvailability: SwapAvailability): ReactNode {
  if (swapAvailability.isEnabled) return null;
  if (swapAvailability.reason === 'disabledByConfig') return <SwapsDisabledTooltipLabel />;
  if (swapAvailability.reason === 'testnet') {
    return (
      <styled.span textStyle="caption.01">
        Swaps are only available on mainnet. Switch networks to swap.
      </styled.span>
    );
  }
  if (swapAvailability.reason === 'missingStacksAccount') {
    return <styled.span textStyle="caption.01">Swaps require a Stacks account.</styled.span>;
  }
  return null;
}

export function AccountActions() {
  const navigate = useNavigate();
  const swapAvailability = useSwapAvailability();

  const swapsBtnDisabled = !swapAvailability.isEnabled;
  const swapDisabledTooltipLabel = getSwapDisabledTooltipLabel(swapAvailability);
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

      <BasicTooltip label={swapDisabledTooltipLabel} side="top" asChild>
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
