import { useState } from 'react';

import { HTMLStyledProps } from 'leather-styles/jsx';

import { ApproverProvider, useRegisterApproverChildren } from './approver-context.shared';
import { ApproverActions } from './components/approver-actions.web';
import { ApproverAdvanced } from './components/approver-advanced.web';
import { ApproverContainer } from './components/approver-container.web';
import { ApproverHeader } from './components/approver-header.web';
import { ApproverSection } from './components/approver-section.web';
import { ApproverStatus } from './components/approver-status.web';
import { ApproverSubheader } from './components/approver-subheader.web';

interface ApproverProps extends HTMLStyledProps<'main'> {
  requester: string;
}
function Approver({ requester, ...props }: ApproverProps) {
  const [isDisplayingAdvancedView, setIsDisplayingAdvancedView] = useState(false);
  const childRegister = useRegisterApproverChildren();

  return (
    <ApproverProvider
      value={{ requester, ...childRegister, isDisplayingAdvancedView, setIsDisplayingAdvancedView }}
    >
      <ApproverContainer {...props} />
    </ApproverProvider>
  );
}

Approver.Header = ApproverHeader;
Approver.Status = ApproverStatus;
Approver.Subheader = ApproverSubheader;
Approver.Section = ApproverSection;
Approver.Advanced = ApproverAdvanced;
Approver.Actions = ApproverActions;

export { Approver };
