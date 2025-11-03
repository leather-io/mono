import { Box, BoxProps, styled } from 'leather-styles/jsx';

export function PortfolioChart(props: BoxProps) {
  return (
    <Box {...props}>
      <styled.h3 textStyle="heading.05" mb="space.04">
        Portfolio performance
      </styled.h3>
      <Box
        borderRadius="md"
        border="default"
        bg="ink.background-secondary"
        p="space.05"
        minHeight="300px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Chart visualization coming soon
        </styled.p>
      </Box>
    </Box>
  );
}
