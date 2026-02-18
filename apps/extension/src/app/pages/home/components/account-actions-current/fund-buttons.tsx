import { useState } from 'react';

import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useFlags } from '@app/features/feature-flags';
import { useNavigate } from '@app/routes/compat';
import { useCurrentAccountNativeSegwitIndexZeroSignerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { ActionButton } from './action-button';
import { FundSheet } from './fund-sheet';

export function FundButtons() {
  const stacksAccount = useCurrentStacksAccount();
  const currentBtcSigner = useCurrentAccountNativeSegwitIndexZeroSignerNullable();
  const btcAccount = currentBtcSigner?.address;
  const { releaseOnramperBuy, releaseOnramperSell } = useFlags();
  const showBuyButton = (!!stacksAccount || !!btcAccount) && releaseOnramperBuy;
  const showSellButton = releaseOnramperSell;
  const bothButtonsEnabled = showBuyButton && showSellButton;

  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  function pageModeRoutingAction(url: string) {
    whenPageMode({
      full() {
        void navigate(url);
      },
      popup() {
        void openIndexPageInNewTab(url);
        closeWindow();
      },
    })();
  }
  const isAtLeastMd = useViewportMinWidth('md');

  function onBuy() {
    return pageModeRoutingAction(RouteUrls.Fund);
  }

  function onSell() {
    return pageModeRoutingAction(RouteUrls.Sell);
  }

  if (isAtLeastMd || !bothButtonsEnabled) {
    return (
      <>
        {showBuyButton && (
          <ActionButton
            data-testid={HomePageSelectors.FundAccountBtn}
            onClick={onBuy}
            variant="solid"
          >
            Buy
          </ActionButton>
        )}
        {showSellButton && (
          <ActionButton data-testid={HomePageSelectors.SellBtn} onClick={onSell} variant="outline">
            Sell
          </ActionButton>
        )}
      </>
    );
  }

  return (
    <>
      <FundSheet
        onBuy={onBuy}
        onSell={onSell}
        onClose={() => setIsDrawerOpen(false)}
        isShowing={isDrawerOpen}
      />
      <ActionButton
        onClick={() => {
          setIsDrawerOpen(true);
        }}
        variant="solid"
      >
        Buy & Sell
      </ActionButton>
    </>
  );
}
