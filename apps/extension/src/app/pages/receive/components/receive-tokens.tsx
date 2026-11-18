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
  onClickQrBtc(): void;
  onClickQrBtcTaproot(): void;
  onClickQrStx(): void;
  onClickVerifyBtc?(): void;
  onClickVerifyBtcTaproot?(): void;
  onClickVerifyStx?(): void;
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

  async function copyAddress(address: string) {
    await copyToClipboard(address);
    toast.success('Copied to clipboard!');
  }
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
          void copyAddress(btcAddressNativeSegwit);
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
          void copyAddress(btcAddressTaproot);
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
          void copyAddress(stxAddress);
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
            void copyAddress(asset.address);
          }}
          title={asset.name}
        />
      ))}
    </Stack>
  );
}
