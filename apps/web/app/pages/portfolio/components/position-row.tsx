import { Box, Flex, styled } from 'leather-styles/jsx';

type PositionType = 'supplied' | 'borrowed' | 'collateral' | 'debt' | 'position' | 'pending';

interface PositionRowProps {
  icon: React.ReactNode;
  name: string;
  type: string;
  apy?: number;
  balance: string;
  balanceSecondary?: string;
  positionType?: PositionType;
}

function getApyColor(apy: number | undefined, positionType?: PositionType): string {
  if (apy === undefined) return 'ink.text-primary';
  if (positionType === 'borrowed' || positionType === 'debt') {
    return 'red.action-primary-default';
  }
  if (apy > 0) return 'green.action-primary-default';
  if (apy < 0) return 'red.action-primary-default';
  return 'ink.text-primary';
}

function getBalanceColor(positionType?: PositionType): string {
  if (positionType === 'borrowed' || positionType === 'debt' || positionType === 'pending') {
    return 'red.action-primary-default';
  }
  return 'green.action-primary-default';
}

function formatApy(apy: number | undefined): string {
  if (apy === undefined) return '';
  const prefix = apy < 0 ? '– ' : '';
  return `${prefix}${Math.abs(apy).toFixed(2)}%`;
}

export function PositionRow({
  icon,
  name,
  type,
  apy,
  balance,
  balanceSecondary,
  positionType,
}: PositionRowProps) {
  const apyColor = getApyColor(apy, positionType);
  const balanceColor = getBalanceColor(positionType);

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      py="space.03"
      px="space.03"
      background="ink.background-primary"
    >
      <Flex alignItems="center" gap="space.03" flex={1} minWidth={0}>
        <Box flexShrink={0}>{icon}</Box>
        <Box minWidth={0}>
          <styled.p textStyle="label.02" color="ink.text-primary" truncate>
            {name}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-primary">
            {type}
          </styled.p>
        </Box>
      </Flex>

      <Flex alignItems="center" gap={0} flexShrink={0}>
        {apy !== undefined && (
          <Box textAlign="center" px="space.05" py="space.03" minWidth="88px" display={['none', 'block']}>
            <styled.p textStyle="body.02" color={apyColor}>
              {formatApy(apy)}
            </styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              APY
            </styled.p>
          </Box>
        )}

        <Box textAlign="right" pl="space.03" minWidth="100px">
          <styled.p textStyle="label.02" color={balanceColor}>
            {balance}
          </styled.p>
          {balanceSecondary && (
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {balanceSecondary}
            </styled.p>
          )}
          {!balanceSecondary && (
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              Balance
            </styled.p>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}
