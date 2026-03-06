import { Box } from 'leather-styles/jsx';

export function MultiWalletIllustration() {
  return (
    <Box width="100%" aspectRatio="342/174" overflow="hidden" position="relative">
      <img
        src="/assets/illustrations/multi-wallet-intro.svg"
        alt="Multi wallet illustration"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Box>
  );
}
