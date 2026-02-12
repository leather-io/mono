import { useLocation, useNavigate } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useFlags } from '@app/features/feature-flags';

interface TokenDetailsPillButtonProps {
  label: string;
  onClick(): void;
  disabled?: boolean;
  testId?: string;
}

function TokenDetailsPillButton({ label, onClick, disabled, testId }: TokenDetailsPillButtonProps) {
  return (
    <styled.button
      type="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="space.03"
      py="space.02"
      height="36px"
      minWidth="78px"
      bg="ink.background-primary"
      border="default"
      borderRadius="999px"
      textStyle="label.02"
      color={disabled ? 'ink.text-subdued' : 'ink.text-primary'}
      opacity={disabled ? 0.6 : 1}
      _hover={disabled ? undefined : { bg: 'ink.component-background-hover', cursor: 'pointer' }}
      onClick={disabled ? undefined : onClick}
      data-testid={testId}
    >
      {label}
    </styled.button>
  );
}

export type SwapChain = 'bitcoin' | 'stacks';

interface TokenDetailsActionsRowProps {
  symbol: string;
  receivePath: string;
  swapChain: SwapChain;
  isBuyEnabled?: boolean;
  isSwapEnabled?: boolean;
}

export function TokenDetailsActionsRow({
  symbol,
  receivePath,
  swapChain,
  isBuyEnabled = true,
  isSwapEnabled = true,
}: TokenDetailsActionsRowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { releaseOnramperBuy } = useFlags();

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
      flexWrap="wrap"
      px="space.05"
      py="space.01"
      width="100%"
      maxWidth="390px"
      margin="0 auto"
    >
      <TokenDetailsPillButton
        label="Send"
        onClick={() =>
          void navigate(RouteUrls.SendCryptoAsset, { state: { backgroundLocation: location } })
        }
        testId="token-details-send-btn"
      />
      <TokenDetailsPillButton
        label="Receive"
        onClick={() => void navigate(receivePath, { state: { backgroundLocation: location } })}
        testId="token-details-receive-btn"
      />
      {releaseOnramperBuy && (
        <TokenDetailsPillButton
          label="Buy"
          disabled={!isBuyEnabled}
          onClick={() => pageModeRoutingAction(RouteUrls.Fund)}
          testId="token-details-buy-btn"
        />
      )}
      <TokenDetailsPillButton
        label="Swap"
        disabled={!isSwapEnabled}
        onClick={() =>
          void navigate(
            RouteUrls.Swap.replace('{chain}', swapChain)
              .replace(':base', symbol)
              .replace(':quote?', '')
          )
        }
        testId="token-details-swap-btn"
      />
    </Flex>
  );
}
