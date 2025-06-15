import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import {
  HeaderLayout,
  HeaderLayoutProps,
} from '@/components/screen/screen-header/components/header.layout';
import { NetworkBadge } from '@/features/settings/network-badge';

export type HeaderProps = HeaderLayoutProps;

export function ScreenHeader({
  rightElement = <NetworkBadge />,
  leftElement = <HeaderBackButton />,
  ...props
}: HeaderProps) {
  return <HeaderLayout leftElement={leftElement} rightElement={rightElement} {...props} />;
}
