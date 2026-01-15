import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';

interface CollectibleContentWrapperProps {
  height: number;
  onPress?(): void;
  children: React.ReactNode;
}

const InteractiveButton = styled('button', {
  border: 'none',
  p: 0,
  m: 0,
  bg: 'transparent',
  width: '100%',
  cursor: 'pointer',
});

export function CollectibleContentWrapper({
  height,
  onPress,
  children,
}: CollectibleContentWrapperProps) {
  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <InteractiveButton type="button" onClick={onPress}>
          {children}
        </InteractiveButton>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{children}</CollectibleCard>;
}
