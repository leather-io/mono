import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { formatCurrency } from '@/utils/currency-formatter';

import {
  ArrowTopBottomIcon,
  Box,
  Pressable,
  SkeletonLoader,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

import { SecondaryAmount } from '../swap-state/swap-state.types';

interface CurrencySwitchProps {
  secondaryAmount: SecondaryAmount;
  onModeSwitch: () => void;
}

const AnimatedBox = Animated.createAnimatedComponent(Box);

export function CurrencyModeSwitcher({ secondaryAmount, onModeSwitch }: CurrencySwitchProps) {
  function renderContent() {
    switch (secondaryAmount.status) {
      case 'idle':
        return <Box width={56} height={20} aria-hidden />;
      case 'pending':
        return <PendingIndicator />;
      case 'error':
        // TODO: Extremely rare, needs better design.
        return (
          <Text variant="label02" color="ink.text-subdued">
            –
          </Text>
        );
      case 'success':
        return (
          <AnimatedBox
            key="success"
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            flexDirection="row"
            alignItems="center"
            gap="2"
          >
            <Text variant="label02" color="ink.text-subdued">
              {formatCurrency(secondaryAmount.value)}
            </Text>
            <ArrowTopBottomIcon variant="small" color="ink.text-subdued" />
          </AnimatedBox>
        );
      default:
        return assertUnreachable(secondaryAmount);
    }
  }

  return (
    <Pressable
      flexDirection="row"
      alignItems="center"
      gap="2"
      onPress={onModeSwitch}
      pressEffects={legacyTouchablePressEffect}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 24 }}
      disabled={secondaryAmount.status !== 'success'}
    >
      {renderContent()}
    </Pressable>
  );
}

function PendingIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box width={56} height={20}>
      {visible && <SkeletonLoader isLoading />}
    </Box>
  );
}
