import { Flex, styled } from 'leather-styles/jsx';

interface BondDetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function BondDetailRow({
  label,
  value,
  valueColor = 'ink.text-primary',
}: BondDetailRowProps) {
  return (
    <Flex justifyContent="space-between" alignItems="center" gap="space.04">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      <styled.span textStyle="caption.01" color={valueColor} textAlign="right">
        {value}
      </styled.span>
    </Flex>
  );
}
