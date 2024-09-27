import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { isString } from '@leather.io/utils';

import { Favicon } from '../../../components/favicon/favicon.web';
import { Flag } from '../../../components/flag/flag.web';
import { ApproverHeaderAnimation } from '../animations/approver-animation.web';
import { useRegisterApproverChild } from '../approver-context.shared';

interface ApproverHeaderProps {
  title: ReactNode;
  requester: ReactNode;
  iconTooltip?: ReactNode;
}
export function ApproverHeader({ title, requester, iconTooltip }: ApproverHeaderProps) {
  useRegisterApproverChild('header');
  return (
    <styled.header p="space.05" className="skip-animation" pos="relative">
      <ApproverHeaderAnimation>
        <styled.h1 textStyle="heading.03" mr={iconTooltip ? 'space.06' : ''}>
          {title}
        </styled.h1>
      </ApproverHeaderAnimation>
      <ApproverHeaderAnimation delay={0.04}>
        <Flag
          mt="space.03"
          textStyle="label.03"
          align="middle"
          img={isString(requester) ? <Favicon origin={requester} /> : requester}
        >
          Requested by {requester}
        </Flag>
      </ApproverHeaderAnimation>
      {iconTooltip && (
        <Box pos="absolute" top="space.05" right="space.05" mt="space.01">
          {iconTooltip}
        </Box>
      )}
    </styled.header>
  );
}
