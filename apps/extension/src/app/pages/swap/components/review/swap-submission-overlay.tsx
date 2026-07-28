import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';
import { motion } from 'framer-motion';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  ArrowLeftIcon,
  Button,
  CheckmarkCircleIcon,
  ErrorCircleIcon,
  Spinner,
} from '@leather.io/ui';

import { SwapReviewSummary } from './swap-review-summary';

interface SwapSubmissionOverlayProps {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
  status: 'submitting' | 'success' | 'failure';
  onReset(): void;
}

export function SwapSubmissionOverlay({
  baseAsset,
  targetAsset,
  baseAmount,
  targetAmount,
  status,
  onReset,
}: SwapSubmissionOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', inset: 0, zIndex: 20 }}
    >
      <Flex direction="column" alignItems="center" bg="ink.background-primary" height="100%">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 120 }}
          transition={{ delay: 0.3, type: 'spring', duration: 0.7, bounce: 0.15 }}
          style={{ paddingBottom: 120, marginBottom: 36 }}
        >
          <SwapReviewSummary
            baseAsset={baseAsset}
            targetAsset={targetAsset}
            baseAmount={baseAmount}
            targetAmount={targetAmount}
          />
        </motion.div>

        <Stack gap="space.03" alignItems="center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.3 }}
          >
            <SubmissionStatusDisplay status={status} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52, duration: 0.3 }}
          >
            <Stack gap="space.03" alignItems="center">
              <SubmissionStatusMessage status={status} />
              {status === 'failure' && <SubmissionFailureMessage onReset={onReset} />}
            </Stack>
          </motion.div>
        </Stack>
      </Flex>
    </motion.div>
  );
}

interface SubmissionStatusDisplayProps {
  status: 'submitting' | 'success' | 'failure';
}

function SubmissionStatusDisplay({ status }: SubmissionStatusDisplayProps) {
  const render = {
    submitting: <Spinner size="24px" />,
    success: <CheckmarkCircleIcon variant="medium" color="green.action-primary-default" />,
    failure: <ErrorCircleIcon variant="medium" color="red.action-primary-default" />,
  };

  return render[status];
}

interface SubmissionStatusMessageProps {
  status: 'submitting' | 'success' | 'failure';
}

function SubmissionStatusMessage({ status }: SubmissionStatusMessageProps) {
  const message = {
    submitting: 'Initiating the swap...',
    success: 'Swap initiated',
    failure: 'Failed to start a swap',
  };

  return (
    <styled.span textStyle="label.01" data-testid={SwapRevampSelectors.SubmissionStatus}>
      {message[status]}
    </styled.span>
  );
}

interface SubmissionFailureMessageProps {
  onReset(): void;
}

function SubmissionFailureMessage({ onReset }: SubmissionFailureMessageProps) {
  return (
    <Stack gap="space.05" alignItems="center" px="space.05">
      <styled.span
        textStyle="body.02"
        color="ink.text-subdued"
        textAlign="center"
        lineHeight="24px"
      >
        Swap wasn't submitted due to an unexpected error. Please try again, or{' '}
        <styled.a
          href={LEATHER_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          textStyle="body.02"
          color="ink.text-subdued"
          textDecoration="underline"
        >
          contact support
        </styled.a>{' '}
        if it persists.
      </styled.span>
      <Button size="sm" variant="outline" iconStart={ArrowLeftIcon} onClick={onReset}>
        Back to review
      </Button>
    </Stack>
  );
}
