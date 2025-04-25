import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountIcon } from '@/store/accounts/utils';

import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

export interface AccountOverviewProps {
  caption: string;
  heading: React.ReactNode;
  icon: AccountIcon;
  isLoading: boolean;
}

export function AccountOverview({ caption, icon, heading, isLoading }: AccountOverviewProps) {
  if (isLoading) {
    return (
      <Box alignItems="center" alignContent="center" alignSelf="stretch" flexWrap="wrap">
        <Box mx="5" py="5" flexDirection="column" alignItems="center" gap="4" flex={1}>
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
      <Box mx="5" py="5" flexDirection="column" alignItems="center" gap="3" flex={1}>
        <AccountAvatar icon={icon} />
        <Box gap="1" flexDirection="column" alignItems="center">
          <Text variant="label02" textAlign="center">
            {caption}
          </Text>
          {heading}
        </Box>
      </Box>
    </Box>
  );
}
