import { useState } from 'react';
import { useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { RouteUrls } from '@shared/route-urls';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { useWalletType } from '@app/common/use-wallet-type';
import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { ActionButton } from './action-button';
import { TransferSheet } from './transfer-sheet';

export function TransferButtons() {
  const navigate = useNavigate();
  const hasBitcoinKeys = useHasCurrentBitcoinAccount();
  const policy = useCurrentPolicy();
  const { showReceive } = useReceiveDialog();

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

  function onReceive() {
    if (policy) showReceive(policy.chain === 'bitcoin' ? 'btc' : 'stx');
    else showReceive(hasBitcoinKeys ? 'full' : 'stx');
    setIsDrawerOpen(false);
  }

  if (policy) {
    return (
      <ActionButton
        data-testid={HomePageSelectors.ReceiveCryptoAssetBtn}
        onClick={onReceive}
        variant="outline"
      >
        Receive
      </ActionButton>
    );
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
