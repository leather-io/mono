import { AccountAvatar, AccountIcon } from '@/features/accounts/components/account-avatar';

import { Box, Text } from '@leather.io/ui/native';

export interface AccountOverviewProps {
  caption: string;
  heading: React.ReactNode;
  icon: AccountIcon;
}

export function AccountOverview({ caption, icon, heading }: AccountOverviewProps) {
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
