import Svg, { Rect } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';
import { Theme } from 'src/theme-native/theme';

import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar } from './avatar.native';

export function RunesAvatarIcon() {
  const { colors } = useTheme<Theme>();

  const lightFill = colors['ink.action-primary-default'];
  const darkFill = colors['ink.background-primary'];

  return (
    <Avatar
      icon={
        <Svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
          <Rect width="32" height="32" rx="16" fill={darkFill} />
          <Rect width="32" height="32" fill={lightFill} />
          <Rect x="4" y="4" width="24" height="24" fill={darkFill} />
          <Rect x="10" y="10" width="12" height="12" fill={lightFill} />
        </Svg>
      }
      indicator={<BtcIcon width={16} height={16} />}
    />
  );
}
