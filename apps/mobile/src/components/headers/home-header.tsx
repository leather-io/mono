import { NetworkBadge } from '@/features/settings/network-badge';

import { Box } from '@leather.io/ui/native';

import { HeaderLeatherLogo } from './components/header-leather-logo';
import { HeaderOptions } from './components/header-options';
import { HeaderLayout } from './header.layout';

export function HomeHeader() {
  // Add subtle margin adjustment for better visual balance
  const logoSpacing = "-1";
  
  return (
    <HeaderLayout
      leftElement={
        <Box flexDirection="row" alignItems="center">
          <HeaderLeatherLogo />
          <NetworkBadge ml={logoSpacing} />
        </Box>
      }
      rightElement={<HeaderOptions />}
    />
  );
}
