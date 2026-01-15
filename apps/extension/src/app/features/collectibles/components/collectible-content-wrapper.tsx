import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';

interface CollectibleContentWrapperProps {
  height: number;
  onPress?(): void;
  children: React.ReactNode;
}

export function CollectibleContentWrapper({
  height,
  onPress,
  children,
}: CollectibleContentWrapperProps) {
  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
          cursor="pointer"
        >
          {children}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{children}</CollectibleCard>;
}
