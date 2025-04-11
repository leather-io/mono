import { deserializeTransaction } from '@stacks/transactions';

import { Approver, Box, Text } from '@leather.io/ui/native';

import { assertContractDeployPayload } from './utils';

export function ContractDeploySummarySection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractDeployPayload(tx.payload);

  const { contractName } = tx.payload;

  return (
    <Approver.Section>
      <Box gap="4">
        <Text variant="label01">{contractName.content}</Text>
      </Box>
    </Approver.Section>
  );
}
