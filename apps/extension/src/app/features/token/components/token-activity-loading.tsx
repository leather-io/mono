import { TokenDetailsSelectors } from '@tests/selectors/token-details.selectors';
import { Circle, Flex, Stack } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

export function TokenActivityLoading() {
  return (
    <Stack data-testid={TokenDetailsSelectors.TokenDetailsActivityLoading}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Flex
          key={i}
          px="space.05"
          py="space.03"
          bg="ink.background-primary"
          gap="space.03"
          alignItems="center"
        >
          <Circle bgColor="ink.component-background-default" size="36px" />
          <Stack gap="space.01" flex="1">
            <SkeletonLoader isLoading height="16px" width="120px" />
            <SkeletonLoader isLoading height="12px" width="80px" />
          </Stack>
          <Stack gap="space.01" alignItems="flex-end">
            <SkeletonLoader isLoading height="16px" width="80px" />
            <SkeletonLoader isLoading height="12px" width="60px" />
          </Stack>
        </Flex>
      ))}
    </Stack>
  );
}
