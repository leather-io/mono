import { View } from 'react-native';

import { DynamicColorCircle } from '../dynamic-color-circle.native';
import { Avatar } from './avatar.native';
import { StxAvatarIcon } from './stx-avatar-icon.native';

interface StacksAssetAvatarProps {
  children: React.ReactNode;
  img?: string;
  gradientString: string;
  isStx?: boolean;
}
export function StacksAssetAvatar({
  children,
  gradientString,
  img,
  isStx, // TODO remove this prop
}: StacksAssetAvatarProps) {
  if (isStx) return <StxAvatarIcon />;
  if (img) return <Avatar icon={<img alt="FT" src={encodeURI(img)} />} fallback="FT" />;

  if (!gradientString) return null;

  return (
    <DynamicColorCircle value="keowkowkeowkeoewkwoe">
      <View style={{ position: 'absolute' }}>{children}</View>
    </DynamicColorCircle>
  );
}
