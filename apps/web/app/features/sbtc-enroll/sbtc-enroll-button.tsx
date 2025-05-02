import { useLeatherConnect } from '~/store/addresses';

import { BasicTooltip, Button, ButtonProps } from '@leather.io/ui';

import { useEnrolledStatus, useSbtcEnroll } from './use-enroll-transaction';

export function EnrollButtonLayout(props: ButtonProps) {
  return <Button fullWidth size="xs" {...props} />;
}

export function SbtcEnrollButton(props: ButtonProps) {
  const { data } = useEnrolledStatus();
  const { whenExtensionState } = useLeatherConnect();
  const { createSbtcYieldEnrollContractCall } = useSbtcEnroll();

  if (data && data.isEnrolled)
    return (
      <BasicTooltip asChild label="You're already enrolled for sBTC rewards">
        <EnrollButtonLayout disabled {...props}>
          Enrolled
        </EnrollButtonLayout>
      </BasicTooltip>
    );

  if (whenExtensionState({ missing: true, detected: true, connected: false })) {
    return (
      <BasicTooltip asChild label="Connect your wallet to enroll for sBTC rewards">
        <EnrollButtonLayout disabled {...props}>
          Enroll
        </EnrollButtonLayout>
      </BasicTooltip>
    );
  }

  return (
    <EnrollButtonLayout onClick={createSbtcYieldEnrollContractCall} {...props}>
      Enroll
    </EnrollButtonLayout>
  );
}
