import { ReactNode } from 'react';
import Animated, {
  Easing,
  FadeIn,
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { DividerProps, Divider as RawDivider } from '@/components/divider';
import { isString } from 'remeda';

import { Box, Button, HasChildren, SettingsGearIcon, Text, TextProps } from '@leather.io/ui/native';

const AnimatedBox = Animated.createAnimatedComponent(Box);
const LayoutTransition = LinearTransition.springify().mass(2).stiffness(700).damping(200);
const EnteringLayoutAnimation = FadeIn.easing(Easing.out(Easing.quad)).duration(240).delay(240);

interface SwapReviewDetailsProps extends HasChildren {
  isRefetching: boolean;
}

export function SwapReviewDetails({ children, isRefetching }: SwapReviewDetailsProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isRefetching ? 0.5 : 1),
  }));

  return (
    <LayoutAnimationConfig skipEntering>
      <AnimatedBox px="7" style={animatedStyle}>
        {children}
      </AnimatedBox>
    </LayoutAnimationConfig>
  );
}

interface SwapReviewDetailRowProps {
  label: ReactNode;
  value: ReactNode;
  info?: ReactNode;
}

export function SwapReviewDetailRow({ label, value, info }: SwapReviewDetailRowProps) {
  return (
    <AnimatedBox
      entering={EnteringLayoutAnimation}
      layout={LayoutTransition}
      height={40}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box flexDirection="row" alignItems="center">
        {renderTextOrNode(label, { variant: 'label02', color: 'ink.text-subdued' })}
        {info}
      </Box>

      {renderTextOrNode(value, { variant: 'label02' })}
    </AnimatedBox>
  );
}

interface SwapReviewDetailToggleProps {
  label: string;
  onPress: () => void;
}

export function SwapReviewDetailToggle({ label, onPress }: SwapReviewDetailToggleProps) {
  return (
    <Button
      borderRadius="md"
      height={30}
      size="sm"
      variant="outline"
      right={-2}
      iconStart={SettingsGearIcon}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

export function SwapReviewDivider(props: DividerProps) {
  return (
    <AnimatedBox layout={LayoutTransition}>
      <RawDivider my="1" {...props} />
    </AnimatedBox>
  );
}

function renderTextOrNode(node: ReactNode, textProps: TextProps) {
  return isString(node) ? <Text {...textProps}>{node}</Text> : node;
}
