import { HStack, styled } from 'leather-styles/jsx';

import { CloseIcon, Flag, IconButton } from '@leather.io/ui';

interface PromoCardLayoutProps {
  img: React.ReactNode;
  message: string;
  onClickCard(): void;
  onDismissCard?(): void;
  isInteractive: boolean;
  isDismissing: boolean;
}
export function PromoCardLayout({
  img,
  message,
  onClickCard,
  onDismissCard,
  isInteractive,
  isDismissing,
}: PromoCardLayoutProps) {
  return (
    <HStack
      cursor={isInteractive ? 'pointer' : 'default'}
      background="ink.background-secondary"
      borderRadius="md"
      border="default"
      gap="space.01"
    >
      <Flag
        cursor={isInteractive ? 'pointer' : 'default'}
        img={img}
        pl="space.01"
        pr="space.00"
        spacing="space.00"
        width="100%"
        onClick={onClickCard}
      >
        <styled.p textStyle="label.02">{message}</styled.p>
      </Flag>
      {onDismissCard && (
        <IconButton
          _hover={{
            color: 'ink.action-primary-hover',
            background: 'transparent',
          }}
          alignSelf="flex-start"
          background="transparent"
          color="ink.action-primary-default"
          icon={<CloseIcon variant="small" color="current" />}
          onClick={onDismissCard}
          height="lg"
          width="lg"
          minHeight="lg"
          minWidth="lg"
          opacity={isInteractive && !isDismissing ? 1 : 0}
          pointerEvents={isInteractive && !isDismissing ? 'auto' : 'none'}
          transition="transition"
        />
      )}
    </HStack>
  );
}
