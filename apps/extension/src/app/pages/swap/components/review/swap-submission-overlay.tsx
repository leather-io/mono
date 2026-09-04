import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';
import { motion } from 'framer-motion';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { type SwapAttention } from '@leather.io/state/swap';
import {
  ArrowLeftIcon,
  Button,
  CheckmarkCircleIcon,
  ErrorCircleIcon,
  ErrorTriangleIcon,
  Spinner,
} from '@leather.io/ui';
import { assertUnreachable, truncateMiddle } from '@leather.io/utils';

import { SwapReviewSummary } from './swap-review-summary';

type SwapSubmissionOverlayStatus = 'submitting' | 'success' | 'needs-attention' | 'failure';

interface SwapSubmissionOverlayProps {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
  status: SwapSubmissionOverlayStatus;
  attention?: SwapAttention;
  onReset(): void;
  onViewActivity(): void;
}

export function SwapSubmissionOverlay({
  baseAsset,
  targetAsset,
  baseAmount,
  targetAmount,
  status,
  attention,
  onReset,
  onViewActivity,
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
              {status === 'needs-attention' && attention && (
                <SwapAttentionMessage attention={attention} onViewActivity={onViewActivity} />
              )}
            </Stack>
          </motion.div>
        </Stack>
      </Flex>
    </motion.div>
  );
}

interface SubmissionStatusDisplayProps {
  status: SwapSubmissionOverlayStatus;
}

function SubmissionStatusDisplay({ status }: SubmissionStatusDisplayProps) {
  const render = {
    submitting: <Spinner size="24px" />,
    success: <CheckmarkCircleIcon variant="medium" color="green.action-primary-default" />,
    'needs-attention': <ErrorTriangleIcon variant="medium" color="yellow.action-primary-default" />,
    failure: <ErrorCircleIcon variant="medium" color="red.action-primary-default" />,
  };

  return render[status];
}

interface SubmissionStatusMessageProps {
  status: SwapSubmissionOverlayStatus;
}

function SubmissionStatusMessage({ status }: SubmissionStatusMessageProps) {
  const message = {
    submitting: 'Initiating the swap...',
    success: 'Swap initiated',
    'needs-attention': 'Swap needs attention',
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

function getAttentionCopy({ reason, txid }: SwapAttention): { lead: string; tail: string } {
  switch (reason) {
    case 'sbtc-notification-failed':
      return {
        lead: "Your Bitcoin was sent, but we couldn't notify the sBTC network to complete the swap. Please",
        tail: 'for help completing it.',
      };
    case 'broadcast-uncertain':
      return {
        lead: `We couldn't confirm whether your Bitcoin transaction ${truncateMiddle(txid)} was sent. Check your activity before trying again, or`,
        tail: "if you're unsure.",
      };
    default:
      assertUnreachable(reason);
  }
}

interface SwapAttentionMessageProps {
  attention: SwapAttention;
  onViewActivity(): void;
}

function SwapAttentionMessage({ attention, onViewActivity }: SwapAttentionMessageProps) {
  const { lead, tail } = getAttentionCopy(attention);
  return (
    <Stack gap="space.05" alignItems="center" px="space.05">
      <styled.span
        textStyle="body.02"
        color="ink.text-subdued"
        textAlign="center"
        lineHeight="24px"
      >
        {lead}{' '}
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
        {tail}
      </styled.span>
      <Button size="sm" variant="outline" onClick={onViewActivity}>
        View activity
      </Button>
    </Stack>
  );
}
