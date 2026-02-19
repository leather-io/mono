import { Flex, styled } from 'leather-styles/jsx';

import { type TrendingToken, getPriceChangeColor } from '@leather.io/features';
import { ArrowTriangleTopIcon, Sip10AvatarIcon } from '@leather.io/ui';

interface TrendingTokenCardProps {
  item: TrendingToken;
}

export function TrendingTokenCard({ item }: TrendingTokenCardProps) {
  const { symbol, name, contractId, imageCanonicalUri } = item.asset;
  const changePercent = item.marketStats.priceChange['1d'] ?? 0;
  const color = getPriceChangeColor(changePercent);

  return (
    <Flex
      alignItems="center"
      borderRadius="round"
      border="1px solid"
      borderColor="ink.border-default"
      px="space.03"
      py="space.02"
      gap="space.02"
      whiteSpace="nowrap"
    >
      <Sip10AvatarIcon
        size="md"
        contractId={contractId}
        imageCanonicalUri={imageCanonicalUri}
        name={name}
      />
      <styled.span textStyle="label.03">{symbol}</styled.span>
      {changePercent !== 0 && (
        <ArrowTriangleTopIcon
          color={color}
          variant="small"
          style={{
            width: 10,
            height: 10,
            transform: changePercent < 0 ? 'rotate(180deg)' : undefined,
          }}
        />
      )}
      <styled.span textStyle="label.03" color={color}>
        {`${Math.abs(changePercent).toFixed(2)}%`}
      </styled.span>
    </Flex>
  );
}
