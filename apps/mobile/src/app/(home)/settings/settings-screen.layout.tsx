import { NakedHeader } from '@/components/headers/naked-header';
import { NetworkBadge } from '@/components/network-badge';
import { HasChildren } from '@/utils/types';

import { Box, Text } from '@leather.io/ui/native';

interface SettingsScreenLayoutProps extends HasChildren {
  title: string;
}
export function SettingsScreenLayout({ children, title }: SettingsScreenLayoutProps) {
  return (
    <>
      <NakedHeader rightElement={<NetworkBadge />} />
      <Box backgroundColor="ink.background-primary" flex={1}>
        <Box gap="5" flex={1} paddingHorizontal="5">
          <Box paddingBottom="5">
            <Text fontWeight={800} variant="heading03">
              {title}
            </Text>
          </Box>
          {children}
        </Box>
      </Box>
    </>
  );
}
