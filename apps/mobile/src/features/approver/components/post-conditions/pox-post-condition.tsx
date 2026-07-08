import { PostConditionPrincipalId, PoxPostConditionWire } from '@stacks/transactions';

import { Approver, Box, CircledFunctionIcon } from '@leather.io/ui/native';

import { formatPoxPostConditionMessage } from './post-conditions.utils';

interface PoxPostConditionProps {
  stacksAddress: string;
  postCondition: PoxPostConditionWire;
}

export function PoxPostCondition({ stacksAddress, postCondition }: PoxPostConditionProps) {
  const isContractPrincipal = postCondition.principal.prefix === PostConditionPrincipalId.Contract;

  const title = formatPoxPostConditionMessage({
    stacksAddress,
    isContractPrincipal,
    postCondition,
  });
  return (
    <Box>
      <Approver.Subheader icon={<CircledFunctionIcon variant="small" />}>
        {title}
      </Approver.Subheader>
    </Box>
  );
}
