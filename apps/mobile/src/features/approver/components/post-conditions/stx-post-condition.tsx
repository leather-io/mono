import { PostConditionPrincipalId, STXPostConditionWire } from '@stacks/transactions';

import { Approver, Box, CircledFunctionIcon } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { StacksOutcome } from '../stacks-outcome';
import { formatPostConditionMessage } from './post-conditions.utils';

interface StxPostConditionProps {
  stacksAddress: string;
  postCondition: STXPostConditionWire;
}

export function StxPostCondition({ stacksAddress, postCondition }: StxPostConditionProps) {
  const isContractPrincipal = postCondition.principal.prefix === PostConditionPrincipalId.Contract;

  const title = formatPostConditionMessage({
    stacksAddress,
    isContractPrincipal,
    postCondition,
  });
  return (
    <Box>
      <Approver.Subheader icon={<CircledFunctionIcon variant="small" />}>
        {title}
      </Approver.Subheader>
      <StacksOutcome amount={createMoney(postCondition.amount, 'STX')} />
    </Box>
  );
}
