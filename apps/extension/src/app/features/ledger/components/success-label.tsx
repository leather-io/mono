import { Flex, FlexProps } from 'leather-styles/jsx';

import { Caption } from '@leather.io/ui';

import { AnimatedCheckmarkIcon } from '@app/components/icons/animated-checkmark-icon';

interface LedgerSuccessLabelProps extends FlexProps {
  children: React.ReactNode;
}
export function LedgerSuccessLabel({ children, ...props }: LedgerSuccessLabelProps) {
  return (
    <Flex alignItems="center" color="green.action-primary-default" flexDirection="row" {...props}>
      <AnimatedCheckmarkIcon />
      <Caption color="inherit" ml="space.02">
        {children}
      </Caption>
    </Flex>
  );
}
