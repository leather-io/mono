import { Box, BoxProps } from 'leather-styles/jsx';
import Lottie from 'lottie-react';

import { useThemeSwitcher } from '@app/common/theme-provider';

import * as animationDataBright from './plugged-in-cable-bright.lottie.json';

// Required for interop with `React.lazy`
// ts-unused-exports:disable-next-line
export default function PluggingInLedgerCableAnimation(props: BoxProps) {
  const { theme } = useThemeSwitcher();
  return (
    <Box height="200px" overflow="hidden" position="relative" width="100%" {...props}>
      <Box
        position="absolute"
        left={0}
        right={0}
        filter={theme === 'light' ? undefined : 'invert()'}
      >
        <Box width="380px" ml="auto" mr="auto">
          <Lottie animationData={animationDataBright} loop={true} />
        </Box>
      </Box>
    </Box>
  );
}
