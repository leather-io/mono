import { useState } from 'react';

import { HasChildren } from 'src/utils/has-children.shared';

import { ApproverProvider, useRegisterApproverChildren } from './approver-context.shared';
import { ApproverActions } from './components/approver-actions.native';
import { ApproverAdvanced } from './components/approver-advanced.native';
import { ApproverContainer } from './components/approver-container.native';
import { ApproverFooter } from './components/approver-footer.native';
import { ApproverHeader } from './components/approver-header.native';
import { ApproverOverview } from './components/approver-overview.native';
import { ApproverSection } from './components/approver-section.native';
import { ApproverSubheader } from './components/approver-subheader.native';

interface ApproverProps extends HasChildren {
  requester?: string;
}
function Approver({ requester, children }: ApproverProps) {
  const [isDisplayingAdvancedView, setIsDisplayingAdvancedView] = useState(false);
  const [actionBarHeight, setActionBarHeight] = useState(100);
  const childRegister = useRegisterApproverChildren();

  return (
    <ApproverProvider
      value={{
        requester,
        isDisplayingAdvancedView,
        setIsDisplayingAdvancedView,
        actionBarHeight,
        setActionBarHeight,
        ...childRegister,
      }}
    >
      {children}
    </ApproverProvider>
  );
}

Approver.Header = ApproverHeader;
Approver.Overview = ApproverOverview;
Approver.Section = ApproverSection;
Approver.Subheader = ApproverSubheader;
Approver.Advanced = ApproverAdvanced;
Approver.Actions = ApproverActions;
Approver.Container = ApproverContainer;
Approver.Footer = ApproverFooter;

export { Approver };
