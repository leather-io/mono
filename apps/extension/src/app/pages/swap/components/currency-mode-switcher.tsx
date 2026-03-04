import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Box, styled } from 'leather-styles/jsx';

import { SecondaryAmount } from '@leather.io/state/swap';
import { ArrowTopBottomIcon, SkeletonLoader } from '@leather.io/ui';
import { assertUnreachable } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';

interface CurrencyModeSwitcherProps {
  secondaryAmount: SecondaryAmount;
  onModeSwitch(): void;
}

export function CurrencyModeSwitcher({ secondaryAmount, onModeSwitch }: CurrencyModeSwitcherProps) {
  function renderContent() {
    switch (secondaryAmount.status) {
      case 'idle':
        return <Box width="56px" height="20px" aria-hidden />;
      case 'pending':
        return <PendingIndicator />;
      case 'error':
        return (
          <styled.span textStyle="label.03" color="ink.text-subdued-secondary">
            {emptyAmountPlaceholder}
          </styled.span>
        );
      case 'success':
        return (
          <AnimatePresence>
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <styled.span
                textStyle="label.03"
                color="ink.text-subdued-secondary"
                position="relative"
                top={0.5}
              >
                {formatCurrency(secondaryAmount.value)}
              </styled.span>
              <ArrowTopBottomIcon variant="small" color="ink.text-subdued-secondary" />
            </motion.div>
          </AnimatePresence>
        );
      default:
        return assertUnreachable(secondaryAmount);
    }
  }

  return (
    <styled.button
      display="flex"
      alignItems="center"
      gap="space.02"
      onClick={onModeSwitch}
      disabled={secondaryAmount.status !== 'success'}
      p="0"
    >
      {renderContent()}
    </styled.button>
  );
}

function PendingIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box width="56px" height="20px">
      {visible && <SkeletonLoader isLoading width="56px" height="20px" />}
    </Box>
  );
}
