import { AnimatePresence, motion } from 'framer-motion';

import type { LedgerStepName } from './ledger-flow.types';

interface AnimatedStepProps {
  stepName: LedgerStepName;
  children: React.ReactNode;
}
export function AnimatedStep({ stepName, children }: AnimatedStepProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepName}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{
          duration: 0.15,
          ease: 'easeInOut',
        }}
        style={{
          width: '100%',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
