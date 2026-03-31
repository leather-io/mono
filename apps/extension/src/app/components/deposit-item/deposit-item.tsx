import { Box } from 'leather-styles/jsx';

import { Button, ItemLayout, Pressable } from '@leather.io/ui';

import { useSpamFilterWithWhitelist } from '@app/common/spam-filter/use-spam-filter';

interface DepositItemProps {
  captionLeft: string;
  icon: React.ReactNode;
  titleLeft: string;
  dataTestId?: string;
  buttonDataTestId?: string;
  onBuy(): void;
  onSelectAsset?(): void;
}
export function DepositItem({
  captionLeft,
  icon,
  titleLeft,
  dataTestId,
  buttonDataTestId,
  onBuy,
  onSelectAsset,
}: DepositItemProps) {
  const spamFilter = useSpamFilterWithWhitelist();

  const buyButton = (
    <Button
      position="absolute"
      right={0}
      zIndex="100"
      top="space.02"
      variant="outline"
      size="sm"
      onClick={onBuy}
      data-testid={buttonDataTestId}
    >
      Buy
    </Button>
  );

  const content = (
    <ItemLayout
      img={icon}
      titleLeft={spamFilter(titleLeft)}
      captionLeft={spamFilter(captionLeft)}
    />
  );

  const isInteractive = !!onSelectAsset;

  if (isInteractive) {
    return (
      <Box position="relative" my="space.02" data-testid={dataTestId}>
        <Pressable onClick={onSelectAsset}>{content}</Pressable>
        {buyButton}
      </Box>
    );
  }

  return (
    <Box position="relative" my="space.02" data-testid={dataTestId}>
      {content}
      {buyButton}
    </Box>
  );
}
