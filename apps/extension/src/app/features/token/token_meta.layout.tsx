import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

interface TokenMetaProps {
  layer: string;
  price?: Money;
}

export function TokenMeta({ layer, price }: TokenMetaProps) {
  return (
    <Stack border="default" borderRadius="md" p="space.04" gap="space.03">
      <styled.h2 textStyle="label.02" margin="0">
        Token details
      </styled.h2>
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Layer
        </styled.span>
        <styled.span textStyle="caption.02">{layer}</styled.span>
      </Flex>
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Price
        </styled.span>
        <styled.span textStyle="caption.02">
          {price ? formatCurrency(price, { showCurrency: true }) : '—'}
        </styled.span>
      </Flex>
    </Stack>
  );
}

