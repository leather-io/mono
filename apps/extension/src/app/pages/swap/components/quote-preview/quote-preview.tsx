import { AnimatePresence, motion } from 'framer-motion';

import { LiveSwapEstimate, SwapState } from '@leather.io/state/swap';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

import { QuotePreviewConstrained } from './quote-preview-constrained';
import { QuotePreviewContent } from './quote-preview-content';
import { QuotePreviewEmptyState } from './quote-preview-empty-state';
import { QuotePreviewError } from './quote-preview-error';
import { QuotePreviewLoadingIndicator } from './quote-preview-loading-indicator';

interface QuotePreviewProps {
  state: SwapState;
  liveEstimate: LiveSwapEstimate;
}

export function QuotePreview({ state, liveEstimate }: QuotePreviewProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderContent(state, liveEstimate)}
    </AnimatePresence>
  );
}

function renderContent(state: SwapState, liveEstimate: LiveSwapEstimate) {
  switch (liveEstimate.status) {
    case 'idle':
    case 'loading':
      if (state.baseAmount === '0' || !state.targetSwapAsset) return null;
      return (
        <motion.div key="loading" {...loadingTransition}>
          <QuotePreviewLoadingIndicator />
        </motion.div>
      );
    case 'error':
      return (
        <motion.div key="error" {...contentTransition}>
          <QuotePreviewError error={liveEstimate.error} onRetry={liveEstimate.refetch} />
        </motion.div>
      );
    case 'empty':
      return (
        <motion.div key="empty" {...contentTransition}>
          <QuotePreviewEmptyState />
        </motion.div>
      );
    case 'constrained':
      assertExistence(
        state.baseSwapAsset,
        "QuotePreview expects 'baseSwapAsset' for constrained state."
      );
      assertExistence(
        state.targetSwapAsset,
        "QuotePreview expects 'targetSwapAsset' for constrained state."
      );
      return (
        <motion.div key="constrained" {...contentTransition}>
          <QuotePreviewConstrained
            constraints={liveEstimate.constraints}
            baseAsset={state.baseSwapAsset.asset}
            targetAsset={state.targetSwapAsset.asset}
          />
        </motion.div>
      );
    case 'success':
      assertExistence(state.baseSwapAsset, "QuotePreview expects 'baseSwapAsset' to be set.");
      assertExistence(state.targetSwapAsset, "QuotePreview expects 'targetSwapAsset' to be set.");
      return (
        <motion.div key="success" {...contentTransition}>
          <QuotePreviewContent
            baseAsset={state.baseSwapAsset.asset}
            targetAsset={state.targetSwapAsset.asset}
            liveEstimate={liveEstimate}
          />
        </motion.div>
      );
    default:
      assertUnreachable(liveEstimate);
  }
}

const easeOut: [number, number, number, number] = [0, 0, 0.58, 1];

const contentTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.16, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: easeOut } },
};

const loadingTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: easeOut } },
};
