import { SpinnerIcon } from '@/components/spinner-icon';

import { Box, BoxProps } from '@leather.io/ui/native';

export function SendFormContainer(props: BoxProps) {
  return <Box px="5" gap="3" flex={1} {...props} />;
}

export function SendFormFooter(props: BoxProps) {
  return <Box flex={1} gap="3" justifyContent="flex-end" {...props} />;
}

export function SendFormLoadingSpinner() {
  return (
    <Box height="60%" justifyContent="center" alignItems="center">
      <Box width={24} height={24}>
        <SpinnerIcon />
      </Box>
    </Box>
  );
}
