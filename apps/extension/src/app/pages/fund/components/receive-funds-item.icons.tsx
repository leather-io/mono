import { Box, styled } from 'leather-styles/jsx';

export function StacksIconComponent() {
  return (
    <Box
      alignItems="center"
      borderRadius="full"
      display="inline-flex"
      height="32px"
      justifyContent="center"
      width="32px"
      backgroundColor="ink.background-primary"
    >
      <styled.span textStyle="label.02">STX</styled.span>
    </Box>
  );
}

export function BitcoinIconComponent() {
  return (
    <Box
      alignItems="center"
      borderRadius="full"
      display="inline-flex"
      height="32px"
      justifyContent="center"
      width="32px"
      backgroundColor="ink.background-primary"
    >
      <styled.span textStyle="label.02">BTC</styled.span>
    </Box>
  );
}
