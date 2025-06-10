import { NetworkBadge } from '@/features/settings/network-badge';

import { Box, LeatherLogomarkIcon } from '@leather.io/ui/native';

import { HeaderActions } from './components/header-actions';
import { HeaderLayout } from './header.layout';

export function HomeHeader() {
  return (
    <HeaderLayout
      leftElement={
        <Box flexDirection="row" alignItems="center" p="2" gap="2">
          <LeatherLogomarkIcon />
          <NetworkBadge />
        </Box>
      }
      rightElement={<HeaderActions />}
    />
  );
}
