import { createContext, useContext } from 'react';

import { useOnMount } from '../../utils/use-on-mount.shared';
import { ChildRegister, useRegisterChildren } from '../../utils/use-register-children.shared';

type ApproverChildren = 'header' | 'actions' | 'advanced' | 'section' | 'subheader' | 'requester';

interface ApproverContext extends ChildRegister<ApproverChildren> {
  requester?: string;
  isDisplayingAdvancedView: boolean;
  actionBarHeight: number;
  setActionBarHeight(val: number): void;
  setIsDisplayingAdvancedView(val: boolean): void;
}

const approverContext = createContext<ApproverContext | null>(null);

export const ApproverProvider = approverContext.Provider;

export function useApproverContext() {
  const context = useContext(approverContext);
  if (!context) throw new Error('`useApproverContext` must be used within a `ApproverProvider`');
  const url = new URL(context?.requester ?? '');
  return { ...context, hostname: url.hostname };
}

export function useRegisterApproverChildren() {
  return useRegisterChildren<ApproverChildren>();
}

export function useRegisterApproverChild(child: ApproverChildren) {
  const { registerChild, deregisterChild, childCount } = useApproverContext();
  if (childCount.actions > 1) throw new Error('Only one `Approver.Actions` is allowed');
  if (childCount.advanced > 1) throw new Error('Only one `Approver.Advanced` is allowed');
  useOnMount(() => {
    registerChild(child);
    return () => deregisterChild(child);
  });
}
