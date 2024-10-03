import { css } from 'leather-styles/css';
import { Flex, HTMLStyledProps, styled } from 'leather-styles/jsx';

import {
  childElementInitialAnimationState,
  useApproverChildrenEntryAnimation,
} from '../animations/approver-animation.web';
import { useApproverContext } from '../approver-context.shared';

const applyMarginsToLastApproverSection = css({
  '& .approver-section:last-child': { mb: 'space.03' },
});

export function ApproverContainer({ children, ...props }: HTMLStyledProps<'main'>) {
  const scope = useApproverChildrenEntryAnimation();
  const { actionBarHeight } = useApproverContext();

  return (
    <styled.main
      display="flex"
      flexDir="column"
      pos="relative"
      minH="100%"
      maxW="640px"
      mx="auto"
      className={applyMarginsToLastApproverSection}
      alignItems="center"
      {...props}
    >
      <Flex
        className={childElementInitialAnimationState}
        width="100%"
        ref={scope}
        flexDir="column"
        flex={1}
        background="ink.background-secondary"
        style={{ paddingBottom: `${actionBarHeight + 16}px` }}
      >
        {children}
      </Flex>
    </styled.main>
  );
}
