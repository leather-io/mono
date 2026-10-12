import { useMemo } from 'react';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { css } from 'leather-styles/css';
import { Stack } from 'leather-styles/jsx';

import { Avatar, BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';
import { isString } from '@leather.io/utils';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useAlexSwappableAssets } from '@app/query/common/alex-sdk/alex-sdk.hooks';

import { receiveTabStyle } from '../receive-tab-style';
import { ReceiveItem } from './receive-item';

interface ReceiveTokensProps {
  btcAddressNativeSegwit: string;
  btcAddressTaproot: string;
  stxAddress: string;
  onClickQrBtc(this: void): void;
  onClickQrBtcTaproot(this: void): void;
  onClickQrStx(this: void): void;
  onClickVerifyBtc?(this: void): void;
  onClickVerifyBtcTaproot?(this: void): void;
  onClickVerifyStx?(this: void): void;
}
export function ReceiveTokens({
  btcAddressNativeSegwit,
  btcAddressTaproot,
  stxAddress,
  onClickQrBtc,
  onClickQrBtcTaproot,
  onClickQrStx,
  onClickVerifyBtc,
  onClickVerifyBtcTaproot,
  onClickVerifyStx,
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
        onCopyAddress={() => {
          void copyToClipboard(btcAddressNativeSegwit).then(() =>
            toast.success('Copied to clipboard!')
          );
        }}
        onClickQrCode={onClickQrBtc}
        onClickVerifyAddress={onClickVerifyBtc}
        verifyDataTestId={HomePageSelectors.ReceiveBtcNativeSegwitVerifyBtn}
        title="Bitcoin (BTC)"
      />
      <ReceiveItem
        address={btcAddressTaproot}
        icon={<BtcAvatarIcon size="xl" />}
        dataTestId={HomePageSelectors.ReceiveBtcTaprootQrCodeBtn}
        onCopyAddress={() => {
          void copyToClipboard(btcAddressTaproot).then(() => toast.success('Copied to clipboard!'));
        }}
        onClickQrCode={onClickQrBtcTaproot}
        onClickVerifyAddress={onClickVerifyBtcTaproot}
        verifyDataTestId={HomePageSelectors.ReceiveBtcTaprootVerifyBtn}
        title="Bitcoin Taproot"
      />
      <ReceiveItem
        address={stxAddress}
        icon={<StxAvatarIcon size="xl" />}
        dataTestId={HomePageSelectors.ReceiveStxQrCodeBtn}
        onCopyAddress={() => {
          void copyToClipboard(stxAddress).then(() => toast.success('Copied to clipboard!'));
        }}
        onClickQrCode={onClickQrStx}
        onClickVerifyAddress={onClickVerifyStx}
        verifyDataTestId={HomePageSelectors.ReceiveStxVerifyBtn}
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
          onCopyAddress={() => {
            void copyToClipboard(asset.address).then(() => toast.success('Copied to clipboard!'));
          }}
          title={asset.name}
        />
      ))}
    </Stack>
  );
}
