import { useState } from 'react';

export function useStakingAcknowledgment(context: string) {
  const [acknowledgment, setAcknowledgment] = useState({
    context,
    accepted: false,
    attempted: false,
  });
  const [attemptCount, setAttemptCount] = useState(0);

  if (acknowledgment.context !== context) {
    setAcknowledgment({ context, accepted: false, attempted: false });
  }

  const isCurrent = acknowledgment.context === context;
  const accepted = isCurrent && acknowledgment.accepted;

  return {
    accepted,
    isInvalid: isCurrent && acknowledgment.attempted && !acknowledgment.accepted,
    attemptCount,
    setAccepted(accepted: boolean) {
      setAcknowledgment({ context, accepted, attempted: false });
    },
    requireAccepted() {
      if (accepted) return true;
      setAcknowledgment({ context, accepted: false, attempted: true });
      setAttemptCount(count => count + 1);
      return false;
    },
  };
}

export type StakingAcknowledgmentState = ReturnType<typeof useStakingAcknowledgment>;
