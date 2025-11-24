import { SpinnerIcon } from '@/components/spinner-icon';

import { Box } from '@leather.io/ui/native';

export function SwapReviewLoadingState() {
  return (
    <Box height="60%" alignItems="center" justifyContent="center">
      <Box width={24} height={24}>
        <SpinnerIcon />
      </Box>
    </Box>
  );
}
