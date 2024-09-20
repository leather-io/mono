import { styled } from 'leather-styles/jsx';
import { HasChildren } from 'src/utils/has-children';

import { useRegisterApproverChild } from '../approver-context.shared';

export function ApproverSection(props: HasChildren) {
  useRegisterApproverChild('section');
  return (
    <styled.section
      className="approver-section"
      mt="space.03"
      px="space.05"
      py="space.03"
      rounded="sm"
      background="ink.background-primary"
      {...props}
    />
  );
}
