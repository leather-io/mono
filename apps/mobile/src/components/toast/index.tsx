import { useImperativeHandle, useRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ResponsiveValue, useTheme } from '@shopify/restyle';

import {
  Box,
  CheckmarkCircleIcon,
  ErrorTriangleIcon,
  InfoCircleIcon,
  Text,
  Theme,
} from '@leather.io/ui/native';

import { ToastData, ToastMethods, ToastProps, ToastType } from './types';

const AnimatedBox = Animated.createAnimatedComponent(Box);

const TOP_POSITION = {
  closed: -100,
  opened: 72,
};

const TOAST_OPEN_DURATION = 3000;

function getIcon(type: ToastType, theme: Theme) {
  switch (type) {
    case 'error':
      return <ErrorTriangleIcon color={theme.colors['red.action-primary-default']} />;
    case 'info':
      return <InfoCircleIcon color={theme.colors['ink.background-primary']} />;
    case 'success':
      return <CheckmarkCircleIcon color={theme.colors['green.action-primary-default']} />;
    default:
      return <InfoCircleIcon color={theme.colors['ink.background-primary']} />;
  }
}

function getBackground(
  type: ToastType
): ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> {
  switch (type) {
    case 'error':
    case 'info':
    case 'success':
      return 'ink.text-primary';
  }
}
export function Toast({ toastRef }: ToastProps) {
  const theme = useTheme<Theme>();
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const top = useSharedValue<number>(TOP_POSITION.closed);
  const timeout = useRef<NodeJS.Timeout>();

  useImperativeHandle<ToastMethods, ToastMethods>(toastRef, () => ({
    display(data) {
      setToastData(data);
      top.value = withTiming(TOP_POSITION.opened);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        top.value = withTiming(TOP_POSITION.closed);
      }, TOAST_OPEN_DURATION);
    },
  }));

  const startingPosition = useSharedValue(TOP_POSITION.closed);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: top.value }],
  }));
  const gesture = Gesture.Pan()
    .onBegin(() => {
      startingPosition.value = top.value;
    })
    .onUpdate(e => {
      if (e.translationY < 0) {
        top.value = startingPosition.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (top.value < startingPosition.value) {
        top.value = withTiming(TOP_POSITION.closed);
      }
      startingPosition.value = TOP_POSITION.closed;
    });
  if (!toastData) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <AnimatedBox
        style={animatedStyle}
        position="absolute"
        bg={getBackground(toastData.type)}
        borderRadius="xs"
        p="3"
        alignSelf="center"
        gap="3"
        flexDirection="row"
        zIndex={9999}
        justifyContent="center"
        alignItems="center"
      >
        {getIcon(toastData.type, theme)}
        <Text variant="label02" color="ink.background-primary">
          {toastData.title}
        </Text>
      </AnimatedBox>
    </GestureDetector>
  );
}
