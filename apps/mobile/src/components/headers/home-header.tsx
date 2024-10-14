import { HeaderLeatherLogo } from './components/header-leather-logo';
import { HeaderOptions } from './components/header-options';
import { HeaderLayout } from './header.layout';

export function HomeHeader() {
  return <HeaderLayout leftElement={<HeaderLeatherLogo />} rightElement={<HeaderOptions />} />;
}
