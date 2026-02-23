import { useState } from 'react';

type ApproverState =
  | 'start_approver'
  | 'retry'
  | 'submitting'
  | 'submitted_checkmark'
  | 'submitted_details';

export function useApproverButtons() {
  const [approverState, setApproverState] = useState<ApproverState>('start_approver');

  return {
    approverState,
    approverButtons: {
      onSubmit() {
        setApproverState('submitting');
      },
      onSubmitSuccess() {
        setApproverState('submitted_checkmark');
        setTimeout(() => {
          setApproverState('submitted_details');
        }, 1000);
      },
      onSubmitFailure() {
        setApproverState('retry');
      },
    },
  };
}
