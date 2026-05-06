import { css } from 'leather-styles/css';
import { Stack } from 'leather-styles/jsx';

import { StxAvatarIcon } from '@leather.io/ui';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';

import { receiveTabStyle } from '../receive-dialog';
import { ReceiveItem } from './receive-item';

interface ReceiveCollectiblesProps {
  stxAddress: string;
  onClickQrStacksNft(): void;
}
export function ReceiveCollectibles({ stxAddress, onClickQrStacksNft }: ReceiveCollectiblesProps) {
  const toast = useToast();
  return (
    <Stack className={css(receiveTabStyle)}>
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
