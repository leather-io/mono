import { HeaderLayout, HeaderLayoutProps } from '@/components/headers/header.layout';
import { NetworkBadge } from '@/features/settings/network-badge';

export type HeaderProps = HeaderLayoutProps;

export function Header({ rightElement = <NetworkBadge />, ...props }: HeaderProps) {
  return <HeaderLayout rightElement={rightElement} {...props} />;
}
