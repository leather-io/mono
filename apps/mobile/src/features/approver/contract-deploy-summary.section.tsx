import { RpcStacksSelectors } from '@/shared/selectors/rpc-stacks.selectors';
import { deserializeTransaction } from '@stacks/transactions';

import { Approver, Box, Text } from '@leather.io/ui/native';

import { assertContractDeployPayload } from './utils';

export function ContractDeploySummarySection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractDeployPayload(tx.payload);

  const { contractName } = tx.payload;

  return (
    <Approver.Section testID={RpcStacksSelectors.ContractDeploySummarySection}>
      <Box gap="4">
        <Text variant="label01">{contractName.content}</Text>
      </Box>
    </Approver.Section>
  );
}
