import { useMemo } from 'react';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { css } from 'leather-styles/css';
import { Stack } from 'leather-styles/jsx';

import { Avatar, BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';
import { isString } from '@leather.io/utils';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useAlexSwappableAssets } from '@app/query/common/alex-sdk/alex-sdk.hooks';

import { receiveTabStyle } from '../receive-dialog';
import { ReceiveItem } from './receive-item';

interface ReceiveTokensProps {
  btcAddressNativeSegwit: string;
  btcAddressTaproot: string;
  stxAddress: string;
  onClickQrBtc(): void;
  onClickQrBtcTaproot(): void;
  onClickQrStx(): void;
}
export function ReceiveTokens({
  btcAddressNativeSegwit,
  btcAddressTaproot,
  stxAddress,
  onClickQrBtc,
  onClickQrBtcTaproot,
  onClickQrStx,
}: ReceiveTokensProps) {
  const toast = useToast();
  const { data: swapAssets = [] } = useAlexSwappableAssets(stxAddress);

  const receivableAssets = useMemo(
    () =>
      swapAssets
        .filter(asset => asset.name !== 'STX')
        .map(asset => ({
          ...asset,
          address: stxAddress,
        })),
    [stxAddress, swapAssets]
  );

  return (
    <Stack className={css(receiveTabStyle)}>
      <ReceiveItem
        address={btcAddressNativeSegwit}
        icon={<BtcAvatarIcon size="xl" />}
        dataTestId={HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn}
        onCopyAddress={async () => {
          await copyToClipboard(btcAddressNativeSegwit);
          toast.success('Copied to clipboard!');
        }}
        onClickQrCode={onClickQrBtc}
        title="Bitcoin (BTC)"
      />
      <ReceiveItem
        address={btcAddressTaproot}
        icon={<BtcAvatarIcon size="xl" />}
        dataTestId={HomePageSelectors.ReceiveBtcTaprootQrCodeBtn}
        onCopyAddress={async () => {
          await copyToClipboard(btcAddressTaproot);
          toast.success('Copied to clipboard!');
        }}
        onClickQrCode={onClickQrBtcTaproot}
        title="Bitcoin Taproot"
      />
      <ReceiveItem
        address={stxAddress}
        icon={<StxAvatarIcon size="xl" />}
        dataTestId={HomePageSelectors.ReceiveStxQrCodeBtn}
        onCopyAddress={async () => {
          await copyToClipboard(stxAddress);
          toast.success('Copied to clipboard!');
        }}
        onClickQrCode={onClickQrStx}
        title="Stacks (STX)"
      />

      {receivableAssets.map(asset => (
        <ReceiveItem
          key={asset.name}
          address={asset.address}
          icon={
            isString(asset.icon) ? (
              <Avatar image={asset.icon} fallback={asset.fallback} />
            ) : (
              asset.icon
            )
          }
          onCopyAddress={async () => {
            await copyToClipboard(asset.address);
            toast.success('Copied to clipboard!');
          }}
          title={asset.name}
        />
      ))}
    </Stack>
  );
}
