import { Box } from 'leather-styles/jsx';

export function MultiWalletIllustration() {
  return (
    <Box width="100%" aspectRatio="125/84" overflow="hidden" position="relative">
      <img
        src="/assets/illustrations/multi-wallet-intro.png"
        alt="Multi wallet illustration"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Box>
  );
}
