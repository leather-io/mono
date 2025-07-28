import { ReactNode } from 'react';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { useRegisterApproverChild } from '../approver-context.shared';

interface ApproverSubheaderProps extends HTMLStyledProps<'h2'> {
  icon?: ReactNode;
}

export function ApproverSubheader({ children, icon, ...props }: ApproverSubheaderProps) {
  useRegisterApproverChild('subheader');
  return (
    <styled.h2
      display="flex"
      textStyle="label.03"
      alignItems="center"
      py="space.03"
      gap="space.01"
      {...props}
    >
      {icon}
      {children}
    </styled.h2>
  );
}
