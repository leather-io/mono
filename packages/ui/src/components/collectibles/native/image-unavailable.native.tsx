import { Box, HasChildren } from '../../../../native';
import { Eye1ClosedIcon } from '../../../icons/eye-1-closed-icon.native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

interface ImageUnavailableProps extends HasChildren {
  height?: number;
}

export function ImageUnavailable({ children, height = 200 }: ImageUnavailableProps) {
  return (
    <CollectibleCardLayout>
      <Box
        height={height}
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
