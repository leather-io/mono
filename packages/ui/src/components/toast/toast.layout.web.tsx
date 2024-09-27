import { Box, HStack, styled } from 'leather-styles/jsx';

import { getIconVariant } from './toast.utils.web';
import { type ToastProps } from './toast.web';

export function ToastLayout({ message, variant }: ToastProps) {
  return (
    <HStack gap="space.03">
      <Box>{getIconVariant(variant)}</Box>
      <styled.span textStyle="label.02">{message}</styled.span>
    </HStack>
  );
}
