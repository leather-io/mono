import type { TrendingToken } from '@leather.io/features';
import { ArrowTriangleTopIcon, Box, Sip10AvatarIcon, Text } from '@leather.io/ui/native';

function getChangeColor(changePercent: number) {
  if (changePercent > 0) {
    return 'green.action-primary-default';
  } else if (changePercent < 0) {
    return 'red.action-primary-default';
  } else {
    return 'ink.text-primary';
  }
}

interface TrendingTokenCardProps {
  item: TrendingToken;
}

export function TrendingTokenCard({ item }: TrendingTokenCardProps) {
  const { symbol, name, contractId, imageCanonicalUri } = item.asset;
  const changePercent = item.marketStats.priceChange['1d'] ?? 0;
  const color = getChangeColor(changePercent);

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      borderRadius="round"
      borderWidth={1}
      borderColor="ink.border-default"
      px="3"
      py="2"
      gap="2"
    >
      <Sip10AvatarIcon
        size="md"
        contractId={contractId}
        imageCanonicalUri={imageCanonicalUri}
        name={name}
      />
      <Text variant="label02">{symbol}</Text>
      {changePercent !== 0 && (
        <ArrowTriangleTopIcon
          color={color}
          width={8}
          height={8}
          style={{
            alignSelf: 'center',
            transform: [{ rotate: changePercent < 0 ? '180deg' : '0deg' }],
          }}
        />
      )}
      <Text variant="label02" color={color}>
        {`${Math.abs(changePercent).toFixed(2)}%`}
      </Text>
    </Box>
  );
}
