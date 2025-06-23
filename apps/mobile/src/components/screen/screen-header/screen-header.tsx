import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadingView } from '@/components/screen/screen-fading-view';
import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { NetworkBadge } from '@/features/settings/network-badge';
import { HEADER_HEIGHT } from '@/shared/constants';

import { Box } from '@leather.io/ui/native';

export interface HeaderProps {
  leftElement?: ReactNode;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
  bottomElement?: ReactNode;
  topElement?: ReactNode;
}

export function ScreenHeader({
  leftElement = <HeaderBackButton />,
  centerElement,
  rightElement = <NetworkBadge />,
  topElement,
  bottomElement,
}: HeaderProps) {
  const { headerVisibility } = useScreenScrollContext();
  const insets = useSafeAreaInsets();

  return (
    <Box
      justifyContent="center"
      width="100%"
      bg="ink.background-primary"
      zIndex="10"
      style={{ paddingTop: insets.top }}
    >
      {topElement}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        height={HEADER_HEIGHT}
        px="4"
      >
        <Box alignItems="flex-start" flexGrow={1} zIndex="20">
          {leftElement}
        </Box>
        <Box
          alignItems="center"
          justifyContent="center"
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
        >
          {centerElement ? (
            <FadingView opacity={headerVisibility}>{centerElement}</FadingView>
          ) : null}
        </Box>
        <Box zIndex="20">{rightElement}</Box>
      </Box>
      {bottomElement}
    </Box>
  );
}
