import { NetworkBadge } from '@/features/settings/network-badge';

import { Box } from '@leather.io/ui/native';

import { HeaderLeatherLogo } from './components/header-leather-logo';
import { HeaderOptions } from './components/header-options';
import { HeaderLayout } from './header.layout';

export function HomeHeader() {
  return (
    <HeaderLayout
      leftElement={
        <Box flexDirection="row" alignItems="center">
          <HeaderLeatherLogo />
          <NetworkBadge ml="-1" />
        </Box>
      }
      rightElement={<HeaderOptions />}
    />
  );
}
