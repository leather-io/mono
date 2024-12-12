import { BoxProps, styled } from 'leather-styles/jsx';

import { HasChildren } from '../../../utils/has-children.shared';
import { useRegisterApproverChild } from '../approver-context.shared';

export function ApproverSection(props: HasChildren & BoxProps) {
  useRegisterApproverChild('section');
  return (
    <styled.section
      className="approver-section"
      mt="space.03"
      px="space.05"
      py="space.03"
      background="ink.background-primary"
      {...props}
    />
  );
}
