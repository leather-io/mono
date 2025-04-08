import { BasicTooltip, Button, ButtonProps } from '@leather.io/ui';

import { useEnrolledStatus, useSbtcEnroll } from './use-enroll-transaction';

export function EnrollButtonLayout(props: ButtonProps) {
  return <Button fullWidth size="xs" {...props} />;
}

export function SbtcEnrollButton(props: ButtonProps) {
  const { data } = useEnrolledStatus();
  const { createSbtcYieldEnrollContractCall } = useSbtcEnroll();

  if (data && data.isEnrolled)
    return (
      <BasicTooltip asChild label="You're already enrolled for sBTC rewards">
        <EnrollButtonLayout disabled {...props}>
          Enrolled
        </EnrollButtonLayout>
      </BasicTooltip>
    );

  return (
    <EnrollButtonLayout onClick={createSbtcYieldEnrollContractCall} {...props}>
      Enroll
    </EnrollButtonLayout>
  );
}
