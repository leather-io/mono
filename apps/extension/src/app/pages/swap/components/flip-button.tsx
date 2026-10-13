import { useCallback, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { css } from 'leather-styles/css';

import { ArrowsRepeatLeftRightIcon } from '@leather.io/ui';

interface FlipButtonProps {
  isVisible: boolean;
  onPress(): void;
}

export function FlipButton({ isVisible, onPress }: FlipButtonProps) {
  const [rotation, setRotation] = useState(90);
  const direction = useRef(1);

  const handleClick = useCallback(() => {
    setRotation(prev => prev + 180 * direction.current);
    direction.current *= -1;
    onPress();
  }, [onPress]);

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.button
          type="button"
          aria-label="Flip assets"
          onClick={handleClick}
          className={flipButtonStyles}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, rotate: rotation }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileTap={{ scale: 0.9 }}
          transition={{
            rotate: { type: 'tween', duration: 0.3 },
            scale: { type: 'spring' },
            opacity: { type: 'spring', damping: 15, stiffness: 200, delay: 0.06 },
          }}
        >
          <ArrowsRepeatLeftRightIcon variant="small" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const flipButtonStyles = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  translate: 'auto',
  translateX: '-1/2',
  translateY: '-1/2',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'round',
  border: '1px solid',
  borderColor: 'ink.border-transparent',
  bg: 'ink.background-primary',
  cursor: 'pointer',
  zIndex: 10,
  p: 0,
});
