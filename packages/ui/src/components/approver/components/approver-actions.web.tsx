import { useEffect, useRef } from 'react';

import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';

import { HasChildren } from '../../../utils/has-children.shared';
import {
  ApproverActionAnimation,
  ApproverActionsAnimationContainer,
} from '../animations/approver-animation.web';
import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

const stretchChildrenStyles = css({ '& > *': { flex: 1 } });

interface ApproverActionsProps extends HasChildren {
  actions: React.ReactNode[];
}
export function ApproverActions({ children, actions }: ApproverActionsProps) {
  useRegisterApproverChild('actions');
  const { setActionBarHeight } = useApproverContext();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setActionBarHeight(rect.height);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setActionBarHeight]);

  return (
    <styled.footer
      ref={ref}
      pos="fixed"
      bottom={0}
      width="100%"
      maxW="640px"
      className="skip-animation"
      borderTop="1px solid"
      borderColor="ink.border-default"
    >
      <ApproverActionsAnimationContainer>
        <styled.div background="ink.background-primary" p="space.05">
          {children}
          <Flex width="100%" gap="space.04" className={stretchChildrenStyles}>
            {actions.map((action, index) => (
              <ApproverActionAnimation key={index} index={index}>
                {action}
              </ApproverActionAnimation>
            ))}
          </Flex>
        </styled.div>
      </ApproverActionsAnimationContainer>
    </styled.footer>
  );
}
