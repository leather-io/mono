import { useFlags } from '@app/features/feature-flags';

import { HomeTabs } from './home-tabs';
import { HomeTabsLegacy } from './home-tabs-legacy';

interface HomeTabsSwitchProps {
  children: React.ReactNode;
}

export function HomeTabsSwitch({ children }: HomeTabsSwitchProps) {
  const { homeTabsRevamp } = useFlags();

  if (homeTabsRevamp) {
    return <HomeTabs>{children}</HomeTabs>;
  }

  return <HomeTabsLegacy>{children}</HomeTabsLegacy>;
}
