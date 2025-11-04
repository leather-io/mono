import { Box, styled } from 'leather-styles/jsx';

export function PortfolioTableEmpty() {
  return (
    <Box p="space.06" textAlign="center">
      <styled.p textStyle="body.02" color="ink.text-subdued">
        No assets to display
      </styled.p>
    </Box>
  );
}
