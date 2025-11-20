import { Loading } from '@/components/loading';

import { Box } from '@leather.io/ui/native';

export function ActivityLoading() {
  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <Loading mode="full" count={5} />
    </Box>
  );
}
