import { Stack, styled } from 'leather-styles/jsx';

import { BnsIcon, LegacyBnsIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card';

function getNameTextStyle(name: string) {
  if (name.length <= 8) return 'heading.05';
  if (name.length <= 11) return 'label.01';
  if (name.length <= 14) return 'label.02';
  return 'label.03';
}

interface BnsCardContentProps {
  name: string;
  isLegacy: boolean;
}

function BnsCardContent({ name, isLegacy }: BnsCardContentProps) {
  return (
    <Stack
      width="100%"
      height="100%"
      bg="ink.background-secondary"
      alignItems="center"
      justifyContent="center"
      gap="space.03"
      px="space.03"
    >
      {isLegacy ? (
        <LegacyBnsIcon width="40%" height="40%" />
      ) : (
        <BnsIcon color="orange.action-primary-default" width="40%" height="40%" />
      )}
      <styled.span
        textStyle={getNameTextStyle(name)}
        maxWidth="100%"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {name}
      </styled.span>
      {isLegacy && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Legacy BNS
        </styled.span>
      )}
    </Stack>
  );
}

interface BnsCardProps {
  name: string;
  isLegacy: boolean;
  onPress?(): void;
}

export function BnsCard({ name, isLegacy, onPress }: BnsCardProps) {
  if (onPress) {
    return (
      <CollectibleCard>
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
          height="100%"
        >
          <BnsCardContent name={name} isLegacy={isLegacy} />
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <BnsCardContent name={name} isLegacy={isLegacy} />
    </CollectibleCard>
  );
}
