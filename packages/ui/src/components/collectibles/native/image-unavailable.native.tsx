import { PropsWithChildren, ReactNode } from 'react';

import { Eye1ClosedIcon } from '../../../icons/eye-1-closed-icon.native';
import { Box } from '../../box/box.native';
import { Text } from '../../text/text.native';
import { CollectibleCard } from './collectible-card.native';

interface ImageUnavailableProps extends PropsWithChildren {
  height?: number;
  message?: ReactNode;
}

const defaultMessage = 'Image currently unavailable';

export function ImageUnavailable({ height = 200, message, children }: ImageUnavailableProps) {
  const label = message ?? children ?? defaultMessage;

  return (
    <CollectibleCard height={height}>
      <Box
        height={height}
        bg="ink.background-secondary"
        justifyContent="center"
        alignItems="center"
      >
        <Eye1ClosedIcon />
        {label ? (
          <Text textAlign="center" variant="label02">
            {label}
          </Text>
        ) : null}
      </Box>
    </CollectibleCard>
  );
}
