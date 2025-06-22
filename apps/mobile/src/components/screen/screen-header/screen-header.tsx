import { FadingView } from '@/components/screen/screen-fading-view';
import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import {
  HeaderLayout,
  HeaderLayoutProps,
} from '@/components/screen/screen-header/components/header.layout';
import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { NetworkBadge } from '@/features/settings/network-badge';

export type HeaderProps = HeaderLayoutProps;

export function ScreenHeader({
  rightElement = <NetworkBadge />,
  leftElement = <HeaderBackButton />,
  centerElement,
  ...props
}: HeaderProps) {
  const { headerVisibility } = useScreenScrollContext();

  return (
    <HeaderLayout
      leftElement={leftElement}
      centerElement={
        centerElement ? <FadingView opacity={headerVisibility}>{centerElement}</FadingView> : null
      }
      rightElement={rightElement}
      {...props}
    />
  );
}
