import { Box, styled } from 'leather-styles/jsx';

export function VaultsPage() {
  return (
    <Box maxWidth="1024px" mx="auto" px="space.05" py="space.07">
      <styled.h1 textStyle="heading.02" mb="space.04">
        Vaults
      </styled.h1>
      <styled.p textStyle="body.02" color="ink.text-subdued">
        Sign in to Bitcoin or Stacks to see your vaults.
      </styled.p>
    </Box>
  );
}
