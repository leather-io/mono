import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { css } from 'leather-styles/css';
import { Stack } from 'leather-styles/jsx';

import { OrdinalAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useFlags } from '@app/features/feature-flags';
import { useToast } from '@app/features/toasts/use-toast';

import { receiveTabStyle } from '../receive-dialog';
import { ReceiveItem } from './receive-item';

interface ReceiveCollectiblesProps {
  btcAddressTaproot: string;
  stxAddress: string;
  onClickQrOrdinal(): void;
  onClickQrStacksNft(): void;
}
export function ReceiveCollectibles({
  btcAddressTaproot,
  stxAddress,
  onClickQrOrdinal,
  onClickQrStacksNft,
}: ReceiveCollectiblesProps) {
  const toast = useToast();
  const { isOrdinalsActive } = useFlags();
  return (
    <Stack className={css(receiveTabStyle)}>
      {isOrdinalsActive && (
        <ReceiveItem
          address={btcAddressTaproot}
          icon={<OrdinalAvatarIcon />}
          dataTestId={HomePageSelectors.ReceiveBtcTaprootQrCodeBtn}
          onCopyAddress={async () => {
            await copyToClipboard(btcAddressTaproot);
            toast.success('Copied to clipboard!');
          }}
          onClickQrCode={onClickQrOrdinal}
          title="Ordinal inscription"
        />
      )}
      <ReceiveItem
        address={stxAddress}
        icon={<StxAvatarIcon />}
        onCopyAddress={async () => {
          await copyToClipboard(stxAddress);
          toast.success('Copied to clipboard!');
        }}
        onClickQrCode={onClickQrStacksNft}
        title="Stacks NFT"
      />
    </Stack>
  );
}
