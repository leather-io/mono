import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { HeaderLayout, HeaderLayoutProps } from '@/components/headers/header.layout';
import { NetworkBadge } from '@/features/settings/network-badge';

export type HeaderProps = HeaderLayoutProps;

export function Header({
  rightElement = <NetworkBadge />,
  leftElement = <HeaderBackButton />,
  ...props
}: HeaderProps) {
  return <HeaderLayout leftElement={leftElement} rightElement={rightElement} {...props} />;
}
