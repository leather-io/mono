import { useEffect, useState } from 'react';
import { FadeIn, FadeOut } from 'react-native-reanimated';

import { emptyAmountPlaceholder } from '@/components/balance/constants';
import { formatCurrency } from '@/utils/currency-formatter';

import { SecondaryAmount } from '@leather.io/state/swap';
import {
  AnimatedBox,
  ArrowTopBottomIcon,
  Box,
  Pressable,
  SkeletonLoader,
  Text,
} from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

interface CurrencySwitchProps {
  secondaryAmount: SecondaryAmount;
  onModeSwitch(): void;
}

export function CurrencyModeSwitcher({ secondaryAmount, onModeSwitch }: CurrencySwitchProps) {
  function renderContent() {
    switch (secondaryAmount.status) {
      case 'idle':
        return <Box width={56} height={20} aria-hidden />;
      case 'pending':
        return <PendingIndicator />;
      case 'error':
        return (
          <Text variant="label02" color="ink.text-subdued-primary">
            {emptyAmountPlaceholder}
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
            gap="1"
          >
            <Text variant="label03" color="ink.text-subdued-primary" style={{ top: 1 }}>
              {formatCurrency(secondaryAmount.value)}
            </Text>
            <ArrowTopBottomIcon variant="small" color="ink.text-subdued-primary" />
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
