import { motion, stagger, useAnimate } from 'framer-motion';
import { css } from 'leather-styles/css';

import { HasChildren } from '../../../utils/has-children.shared';
import { useOnMount } from '../../../utils/use-on-mount.shared';

const animationSelector = '& > *:not(.skip-animation)';

const staggerMenuItems = stagger(0.06, { startDelay: 0.3 });

export function useApproverChildrenEntryAnimation() {
  const [scope, animate] = useAnimate();

  useOnMount(() => {
    // Animation throws if there are no children
    try {
      animate(
        animationSelector,
        { opacity: [0, 1], transform: ['translateY(-16px)', 'translateY(0)'] },
        {
          duration: 0.36,
          delay: staggerMenuItems,
          ease: 'easeOut',
        }
      );
      // eslint-disable-next-line no-empty
    } catch {}
  });

  return scope;
}

const actionsContainerDelay = 0.64;
export function ApproverActionsAnimationContainer(props: HasChildren) {
  return (
    <motion.div
      animate={{
        opacity: [0, 1],
      }}
      transition={{ duration: 0.3, delay: actionsContainerDelay, ease: 'easeOut' }}
      {...props}
    />
  );
}

interface ApproverActionAnimationProps extends HasChildren {
  index: number;
}
export function ApproverActionAnimation({ children, index }: ApproverActionAnimationProps) {
  const delay = actionsContainerDelay + 0.04 + (index + 1) * 0.04;
  return (
    <motion.div
      style={{ display: 'flex' }}
      className={css({ '& > *': { flex: 1 } })}
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.48, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
