import {
  CopyIcon,
  IconButton,
  ItemLayoutWithButtons,
  Pressable,
  QrCodeIcon,
  ShieldIcon,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

interface ReceiveItemProps {
  address?: string;
  dataTestId?: string;
  icon: React.ReactNode;
  onCopyAddress(): void;
  onClickQrCode?(): void;
  onClickVerifyAddress?(): void;
  verifyDataTestId?: string;
  title: string;
}
export function ReceiveItem({
  address,
  dataTestId,
  icon,
  onCopyAddress,
  onClickQrCode,
  onClickVerifyAddress,
  verifyDataTestId,
  title,
}: ReceiveItemProps) {
  if (!address) return null;
  return (
    <Pressable my="space.02" width="100%">
      <ItemLayoutWithButtons
        img={icon}
        title={title}
        caption={truncateMiddle(address, 6)}
        buttons={
          <>
            {onClickVerifyAddress && (
              <BasicTooltip asChild label="Verify on device">
                <IconButton
                  data-testid={verifyDataTestId}
                  icon={<ShieldIcon />}
                  mr="space.02"
                  onClick={onClickVerifyAddress}
                />
              </BasicTooltip>
            )}
            <IconButton icon={<CopyIcon />} onClick={onCopyAddress} />
            {onClickQrCode && (
              <IconButton
                data-testid={dataTestId}
                icon={<QrCodeIcon />}
                ml="space.02"
                onClick={onClickQrCode}
              />
            )}
          </>
        }
      />
    </Pressable>
  );
}
