import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Box, Stack } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';
import get from 'lodash.get';

import { BitcoinIcon, Sheet, SheetHeader, StacksIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { useLocationState } from '@app/common/hooks/use-location-state';
import { stacksValue } from '@app/common/stacks-utils';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import {
  useNativeSegwitBtcAccountBalance,
  useTaprootBtcAccountBalance,
} from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useStxAddressBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useBackgroundLocationRedirect } from '@app/routes/hooks/use-background-location-redirect';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { ReceiveAddressCard } from './components/receive-address-card';

export function ReceiveSheet() {
  useBackgroundLocationRedirect();

  const backgroundLocation = useLocationState<Location>('backgroundLocation');
  const navigate = useNavigate();
  const location = useLocation();
  const btcAddressNativeSegwit = useCurrentAccountNativeSegwitAddressIndexZero();
  const stxAddress = useCurrentStacksAccountAddress();
  const accountIndex = get(location.state, 'accountIndex', undefined);
  const btcAddressTaproot = useZeroIndexTaprootAddress(accountIndex);

  const currentAccountIndex = useCurrentAccountIndex();

  const { value: stxBalanceData } = useStxAddressBalance(stxAddress);
  const stxBalance = useMemo(
    () =>
      stacksValue({
        value: stxBalanceData?.stx.unlockedBalance.amount ?? 0,
        withTicker: true,
      }),
    [stxBalanceData?.stx.unlockedBalance.amount]
  );

  const nativeSegwitBalance = useNativeSegwitBtcAccountBalance(currentAccountIndex);
  const nativeSegwitFormatted = nativeSegwitBalance.value
    ? formatCurrency(nativeSegwitBalance.value.btc.availableBalance)
    : '';

  const taprootBalance = useTaprootBtcAccountBalance(currentAccountIndex);
  const taprootFormatted = taprootBalance.value
    ? formatCurrency(taprootBalance.value.btc.availableBalance)
    : '';

  function handleClose() {
    void navigate(backgroundLocation ?? '..');
  }

  async function handleCopyStx() {
    analytics.track('copy_stx_address_to_clipboard');
    await copyToClipboard(stxAddress);
  }

  async function handleCopyBtcNativeSegwit() {
    analytics.track('copy_btc_address_to_clipboard', { type: 'btc' });
    await copyToClipboard(btcAddressNativeSegwit);
  }

  async function handleCopyBtcTaproot() {
    analytics.track('copy_btc_address_to_clipboard', { type: 'btc-taproot' });
    await copyToClipboard(btcAddressTaproot);
  }

  return (
    <Sheet
      header={<SheetHeader variant="large" title="Receive" onClose={handleClose} />}
      onClose={handleClose}
      isShowing
      wrapChildren={false}
    >
      <Box overflowY="auto" flex="1">
        <Box
          position="sticky"
          top="0"
          h="20px"
          zIndex="1"
          pointerEvents="none"
          style={{
            background: `linear-gradient(to bottom, ${token('colors.ink.background-primary')}, transparent)`,
          }}
        />
        <Stack gap="space.04" px="space.05" pb="space.05">
          <ReceiveAddressCard
            title="Stacks"
            tooltipText="STX, sBTC, USDCx, Stacks NFTs, and BNS names"
            address={stxAddress}
            balance={stxBalance}
            copyButtonColor="#FC6432"
            copyButtonIcon={<StacksIcon variant="small" color="ink.background-primary" />}
            onCopyAddress={handleCopyStx}
            qrCodeTestId={HomePageSelectors.ReceiveStxQrCodeBtn}
            onClickQrCode={() =>
              navigate(`${RouteUrls.Home}${RouteUrls.ReceiveStx}`, {
                state: { backgroundLocation },
              })
            }
          />
          <ReceiveAddressCard
            title="Bitcoin Native Segwit"
            tooltipText="Standard BTC address."
            address={btcAddressNativeSegwit}
            balance={nativeSegwitFormatted}
            copyButtonColor="#F59300"
            copyButtonIcon={<BitcoinIcon variant="small" color="ink.background-primary" />}
            onCopyAddress={handleCopyBtcNativeSegwit}
            qrCodeTestId={HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn}
            onClickQrCode={() =>
              navigate(`${RouteUrls.Home}${RouteUrls.ReceiveBtc}`, {
                state: { backgroundLocation },
              })
            }
          />
          <ReceiveAddressCard
            title="Bitcoin Taproot"
            tooltipText="BTC for Ordinals, Runes, and inscriptions"
            address={btcAddressTaproot}
            balance={taprootFormatted}
            copyButtonColor="#F59300"
            copyButtonIcon={<BitcoinIcon variant="small" color="ink.background-primary" />}
            onCopyAddress={handleCopyBtcTaproot}
            qrCodeTestId={HomePageSelectors.ReceiveBtcTaprootQrCodeBtn}
            onClickQrCode={() =>
              navigate(`${RouteUrls.Home}${RouteUrls.ReceiveBtc}`, {
                state: { backgroundLocation, btcAddress: btcAddressTaproot },
              })
            }
          />
        </Stack>
      </Box>
    </Sheet>
  );
}
