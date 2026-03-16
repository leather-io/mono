import { Box, styled } from 'leather-styles/jsx';

export function PortfolioTableEmpty() {
  return (
    <Box p="space.06" textAlign="center" border="default" borderRadius="sm" flexGrow={1}>
      <styled.p textStyle="body.02" color="ink.text-subdued-primary">
        No assets to display
      </styled.p>
    </Box>
  );
}
