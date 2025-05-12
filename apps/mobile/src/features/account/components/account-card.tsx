import { ComponentType, ReactNode } from 'react';

import { Loading } from '@/components/loading/loading';
import { WidgetCard } from '@/components/widget';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AppIcons } from '@/features/accounts/components/app-icons';
import { AccountIcon } from '@/store/accounts/utils';

import { Box, HasChildren, PressableProps, Text } from '@leather.io/ui/native';
import { isString } from '@leather.io/utils';

interface AccountCardProps extends PressableProps {
  icon: AccountIcon | ComponentType;
  caption?: string;
  primaryTitle: ReactNode;
  secondaryTitle?: ReactNode;
  address?: ReactNode;
  onPress?(): void;
  onLongPress?(): void;
  testID?: string;
  iconTestID?: string;
  appIcons?: string[];
  isLoading?: boolean;
}

export function AccountCard({
  caption,
  primaryTitle,
  secondaryTitle,
  icon,
  address,
  onPress,
  appIcons,
  isLoading,
  ...props
}: AccountCardProps) {
  if (isLoading) {
    return <Loading mode="widget" />;
  }

  return (
    <WidgetCard height={156} onPress={onPress}>
      <Box flexDirection="row" justifyContent="space-between">
        <AccountAvatar icon={icon} />
        {address}
      </Box>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-end"
        gap="2"
        mb="-0.5"
      >
        <Box gap="0.5" flexShrink={1}>
          {caption && (
            <Text variant="label03" numberOfLines={1}>
              {caption}
            </Text>
          )}
          <Title>{primaryTitle}</Title>
        </Box>
        <Title>{secondaryTitle}</Title>
      </Box>
      {appIcons && <AppIcons appIcons={appIcons} />}
    </WidgetCard>
  );
}

function Title({ children }: HasChildren) {
  if (!children) {
    return null;
  }

  if (isString(children)) {
    return (
      <Text variant="label01" numberOfLines={1}>
        {children}
      </Text>
    );
  }

  return children;
}
