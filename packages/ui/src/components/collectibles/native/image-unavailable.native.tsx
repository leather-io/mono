import { Box, HasChildren } from '../../../../native';
import { Eye1ClosedIcon } from '../../../icons/eye-1-closed-icon.native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

interface ImageUnavailableProps extends HasChildren {
  size?: number;
}

export function ImageUnavailable({ children, size = 200 }: ImageUnavailableProps) {
  return (
    <CollectibleCardLayout>
      <Box
        width={size}
        height={size}
        bg="ink.background-secondary"
        justifyContent="center"
        alignItems="center"
      >
        <Eye1ClosedIcon />
        {children}
      </Box>
    </CollectibleCardLayout>
  );
}
