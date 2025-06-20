import { Balance } from '@/components/balance/balance';
import { Card } from '@/components/card';

import { FungibleCryptoAsset, Money, OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Box, Text } from '@leather.io/ui/native';

import { getActivityStatusLabel } from './utils/format-activity';

interface ActivityCardProps {
  type: OnChainActivity['type'];
  asset: FungibleCryptoAsset | undefined;
  status: OnChainActivity['status'];
  onPress: () => void;
  quoteBalance: Money | undefined;
  cryptoBalance: Money | undefined;
}

export function ActivityCard({
  type,
  asset,
  status,
  onPress,
  quoteBalance,
  cryptoBalance,
}: ActivityCardProps) {
  return (
    <Card onPress={onPress} width={200}>
      <Box flexDirection="row" justifyContent="space-between">
        <ActivityAvatarIcon type={type} asset={asset} status={status} />
      </Box>
      <Box flexDirection="column" alignItems="flex-start" flexShrink={0} alignSelf="stretch">
        <Box alignItems="flex-start" gap="1" alignSelf="stretch">
          <Text variant="label02">
            {getActivityStatusLabel({
              type: type,
              status: status,
            })}
          </Text>
          {(type === 'sendAsset' || type === 'receiveAsset') && quoteBalance && cryptoBalance && (
            <Box alignItems="flex-start" gap="1" alignSelf="stretch">
              <Balance balance={cryptoBalance} variant="label02" />
              <Balance
                balance={quoteBalance}
                variant="caption01"
                color="ink.text-subdued"
                fontWeight="400"
                lineHeight={16}
                isQuoteCurrency
              />
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
