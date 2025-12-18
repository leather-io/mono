import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { RouteUrls } from '@shared/route-urls';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useWalletType } from '@app/common/use-wallet-type';
import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useConfigBitcoinEnabled } from '@app/query/common/remote-config/remote-config.query';

import { ActionButton } from './action-button';
import { TransferSheet } from './transfer-sheet';

export function TransferButtons() {
  const navigate = useNavigate();
  const location = useLocation();
  const isBitcoinEnabled = useConfigBitcoinEnabled();

  const receivePath = isBitcoinEnabled
    ? `${RouteUrls.Home}${RouteUrls.Receive}`
    : `${RouteUrls.Home}${RouteUrls.ReceiveStx}`;

  const { whenWallet } = useWalletType();
  const isAtLeastMd = useViewportMinWidth('md');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function onSend() {
    return whenWallet({
      ledger: () =>
        whenPageMode({
          full: () => void navigate(RouteUrls.SendCryptoAsset),
          popup: () => void openIndexPageInNewTab(RouteUrls.SendCryptoAsset),
        })(),
      software: () => navigate(RouteUrls.SendCryptoAsset),
    })();
  }

  async function onReceive() {
    await navigate(receivePath, { state: { backgroundLocation: location } });
    setIsDrawerOpen(false);
  }

  if (isAtLeastMd) {
    return (
      <>
        <ActionButton
          data-testid={HomePageSelectors.SendCryptoAssetBtn}
          onClick={onSend}
          variant="outline"
        >
          Send
        </ActionButton>
        <ActionButton
          data-testid={HomePageSelectors.ReceiveCryptoAssetBtn}
          onClick={onReceive}
          variant="outline"
        >
          Receive
        </ActionButton>
      </>
    );
  }

  return (
    <>
      <ActionButton
        data-testid={HomePageSelectors.ReceiveCryptoAssetBtn}
        onClick={() => {
          setIsDrawerOpen(true);
        }}
        variant="outline"
      >
        Transfer
      </ActionButton>
      <TransferSheet
        isShowing={isDrawerOpen}
        onSend={onSend}
        onReceive={onReceive}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
