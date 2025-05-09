import { useIsTouchDevice } from '~/helpers/use-is-touch-device';

import { Flag, FlagProps, InfoCircleIcon } from '@leather.io/ui';

export function InfoLabel({ children, ...props }: FlagProps) {
  const isTouchDevice = useIsTouchDevice();
  if (isTouchDevice) return children;
  return (
    <Flag
      spacing="space.01"
      reverse
      img={<InfoCircleIcon color={'inherit' as any} variant="small" />}
      {...props}
    >
      {children}
    </Flag>
  );
}
