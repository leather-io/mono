import { Box, BoxProps } from 'leather-styles/jsx';

import { DynamicColorCircle } from '../dynamic-color-circle.web';
import { Avatar } from './avatar.web';
import { StxAvatarIcon } from './stx-avatar-icon.web';

interface StacksAssetAvatarProps extends BoxProps {
  img?: string;
  gradientString: string;
  isStx?: boolean;
  size?: string;
}
export function StacksAssetAvatar({
  children,
  gradientString,
  img,
  isStx,
  size = '36',
  ...props
}: StacksAssetAvatarProps) {
  if (isStx) return <StxAvatarIcon />;

  const { color } = props;

  if (img) return <Avatar icon={<img alt="FT" src={encodeURI(img)} />} fallback="FT" />;

  if (!gradientString) return null;

  return (
    <DynamicColorCircle color={color} size={size} value={gradientString}>
      <Box position="absolute">{children}</Box>
    </DynamicColorCircle>
  );
}
