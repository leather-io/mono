import { useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Flex } from 'leather-styles/jsx';
import { AnimateChangeInHeight } from 'src/components/animate-height/animate-height.web';
import { Button } from 'src/components/button/button.web';
import { Flag } from 'src/components/flag/flag.web';
import { ChevronDownIcon } from 'src/icons/chevron-down-icon.web';
import { HasChildren } from 'src/utils/has-children';
import { getScrollParent } from 'src/utils/utils.web';

import { delay } from '@leather.io/utils';

import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

const slightPauseForContentEnterAnimation = () => delay(120);

export function ApproverAdvanced({ children }: HasChildren) {
  const { isDisplayingAdvancedView, setIsDisplayingAdvancedView } = useApproverContext();
  useRegisterApproverChild('advanced');

  const ref = useRef<HTMLButtonElement>(null);

  async function handleToggleAdvancedView() {
    setIsDisplayingAdvancedView(!isDisplayingAdvancedView);
    if (ref.current && !isDisplayingAdvancedView) {
      await slightPauseForContentEnterAnimation();
      const scrollPosition = ref.current.offsetTop;
      const scrollParent = getScrollParent(ref.current);
      scrollParent?.parentElement?.scroll({ top: scrollPosition, behavior: 'smooth' });
    }
  }

  return (
    <>
      <Button
        ref={ref}
        variant="ghost"
        textAlign="left"
        mt="space.03"
        mb={!isDisplayingAdvancedView ? 'space.03' : 0}
        px="space.05"
        onClick={handleToggleAdvancedView}
      >
        <Flag img={<ChevronDownIcon variant="small" />} reverse>
          {isDisplayingAdvancedView ? 'Hide' : 'Show'} advanced details
        </Flag>
      </Button>
      <AnimateChangeInHeight>
        <Flex justifyContent="center" flexDir="column">
          <AnimatePresence>
            {isDisplayingAdvancedView && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </Flex>
      </AnimateChangeInHeight>
    </>
  );
}
