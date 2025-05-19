import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountIcon } from '@/store/accounts/utils';

import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

export interface AccountOverviewProps {
  heading: React.ReactNode;
  icon: AccountIcon;
  isLoading: boolean;
  accountName: string;
  walletName: string;
}

export function AccountOverview({
  icon,
  heading,
  isLoading,
  accountName,
  walletName,
}: AccountOverviewProps) {
  if (isLoading) {
    return (
      <Box alignItems="center" alignContent="center" alignSelf="stretch" flexWrap="wrap">
        <Box mx="5" pt="4" pb="8" flexDirection="column" alignItems="center" gap="4" flex={1}>
          <Box flexDirection="row" height={64} width={64} borderRadius="round" overflow="hidden">
            <SkeletonLoader height={64} width={64} isLoading={true} />
          </Box>
          <SkeletonLoader height={44} width={132} isLoading={true} />
        </Box>
      </Box>
    );
  }
  return (
    <Box alignItems="center" alignContent="center" alignSelf="stretch" flexWrap="wrap">
      <Box mx="5" pt="4" pb="8" flexDirection="column" alignItems="center" gap="3" flex={1}>
        <AccountAvatar icon={icon} />
        {heading}
        <Box gap="1" flexDirection="column" alignItems="center">
          <Text variant="label01" textAlign="center">
            {accountName}
          </Text>
          <Text variant="caption01" textAlign="center">
            {walletName}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
