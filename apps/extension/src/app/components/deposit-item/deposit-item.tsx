import { Box } from 'leather-styles/jsx';

import { Button, ItemLayout } from '@leather.io/ui';

import { useSpamFilterWithWhitelist } from '@app/common/spam-filter/use-spam-filter';

interface DepositItemProps {
  captionLeft: string;
  icon: React.ReactNode;
  titleLeft: string;
  dataTestId?: string;
  buttonDataTestId?: string;
  onBuy(): void;
}
export function DepositItem({
  captionLeft,
  icon,
  titleLeft,
  dataTestId,
  buttonDataTestId,
  onBuy,
}: DepositItemProps) {
  const spamFilter = useSpamFilterWithWhitelist();

  const titleRight = (
    <Button variant="outline" size="sm" onClick={onBuy} data-testid={buttonDataTestId}>
      Buy
    </Button>
  );

  const content = (
    <ItemLayout
      img={icon}
      titleLeft={spamFilter(titleLeft)}
      captionLeft={spamFilter(captionLeft)}
      titleRight={titleRight}
    />
  );

  return (
    <Box my="space.02" data-testid={dataTestId}>
      {content}
    </Box>
  );
}
