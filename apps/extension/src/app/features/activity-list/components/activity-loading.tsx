import { Flex, Stack } from 'leather-styles/jsx';

import { LoadingSpinner } from '@leather.io/ui';

export function ActivityLoading() {
  return (
    <Stack flexGrow={1} position="relative">
      <Flex p="space.06" textAlign="center" fontSize="24px" justifyContent="center" flexGrow={1}>
        <LoadingSpinner />
      </Flex>
    </Stack>
  );
}
