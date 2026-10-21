import { css } from 'leather-styles/css';
import { Stack } from 'leather-styles/jsx';

import { StxAvatarIcon } from '@leather.io/ui';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';

import { receiveTabStyle } from '../receive-tab-style';
import { ReceiveItem } from './receive-item';

interface ReceiveCollectiblesProps {
  stxAddress: string;
  onClickQrStacksNft(): void;
}
export function ReceiveCollectibles({ stxAddress, onClickQrStacksNft }: ReceiveCollectiblesProps) {
  const toast = useToast();

  async function copyAddress(address: string) {
    await copyToClipboard(address);
    toast.success('Copied to clipboard!');
  }
  return (
    <Stack className={css(receiveTabStyle)}>
      <ReceiveItem
        address={stxAddress}
        icon={<StxAvatarIcon />}
        onCopyAddress={() => {
          void copyAddress(stxAddress);
        }}
        onClickQrCode={onClickQrStacksNft}
        title="Stacks NFT"
      />
    </Stack>
  );
}
