import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';

import type { HasChildren } from '../../../utils/has-children.shared';
import {
  ApproverActionAnimation,
  ApproverActionsAnimationContainer,
} from '../animations/approver-animation.web';
import { useRegisterApproverChild } from '../approver-context.shared';

const stretchChildrenStyles = css({ '& > *': { flex: 1 } });

interface ApproverActionsProps extends HasChildren {
  actions: React.ReactNode[];
}
export function ApproverActions({ children, actions }: ApproverActionsProps) {
  useRegisterApproverChild('actions');
  return (
    <styled.footer pos="sticky" mt="auto" bottom={0} className="skip-animation">
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
