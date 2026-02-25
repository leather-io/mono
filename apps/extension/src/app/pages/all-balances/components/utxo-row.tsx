import { Flex, styled } from 'leather-styles/jsx';

interface UtxoRowProps {
  label: string;
  sats: string;
  fiatValue: string;
}

export function UtxoRow({ label, sats, fiatValue }: UtxoRowProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      py="space.02"
      px="space.03"
      bg="ink.background-secondary"
      borderRadius="xs"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      <Flex gap="space.04" alignItems="center">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {sats}
        </styled.span>
        <styled.span textStyle="caption.01">{fiatValue}</styled.span>
      </Flex>
    </Flex>
  );
}
