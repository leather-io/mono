import { Box, HStack, styled } from 'leather-styles/jsx';

import { ToastCountdownIcon } from './toast-countdown-icon.web';
import { getIconVariant } from './toast.utils.web';
import { type ToastProps } from './toast.web';

interface ToastLayoutProps extends ToastProps {
  duration?: number;
  isPaused?: boolean;
  isClosing?: boolean;
  onCountdownEnd?(this: void): void;
}

export function ToastLayout({
  message,
  variant,
  duration,
  isPaused,
  isClosing,
  onCountdownEnd,
}: ToastLayoutProps) {
  return (
    <HStack gap="space.03">
      <Box>
        {variant === 'success' && duration ? (
          <ToastCountdownIcon
            duration={duration}
            isPaused={isPaused}
            isClosing={isClosing}
            onComplete={onCountdownEnd}
          />
        ) : (
          getIconVariant(variant)
        )}
      </Box>
      <styled.span textStyle="label.02">{message}</styled.span>
    </HStack>
  );
}
