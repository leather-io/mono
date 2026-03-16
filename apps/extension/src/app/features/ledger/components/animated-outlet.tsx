import { useLocation, useOutlet } from 'react-router';

import { AnimatePresence, motion } from 'framer-motion';

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  if (!outlet) return null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
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
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
