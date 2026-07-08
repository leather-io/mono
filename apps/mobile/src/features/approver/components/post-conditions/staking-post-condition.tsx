import { PostConditionPrincipalId, StakingPostConditionWire } from '@stacks/transactions';

import { Approver, Box, CircledFunctionIcon } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { StacksOutcome } from '../stacks-outcome';
import { formatPostConditionMessage } from './post-conditions.utils';

interface StakingPostConditionProps {
  stacksAddress: string;
  postCondition: StakingPostConditionWire;
}

export function StakingPostCondition({ stacksAddress, postCondition }: StakingPostConditionProps) {
  const isContractPrincipal = postCondition.principal.prefix === PostConditionPrincipalId.Contract;

  const title = formatPostConditionMessage({
    stacksAddress,
    isContractPrincipal,
    postCondition,
    context: 'stake',
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
