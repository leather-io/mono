import { HStack, styled } from 'leather-styles/jsx';

export function ZeroPercentFeesBadge() {
  return (
    <HStack
      alignItems="center"
      border="default"
      borderRadius="xxl"
      height="24px"
      justifyContent="center"
      paddingX="space.02"
      paddingY="space.01"
      gap="space.01"
    >
      <styled.span color="warning.label" textStyle="caption.02">
        0 % Fees
      </styled.span>
    </HStack>
  );
}
