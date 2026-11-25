import { assertContractCallPayload, getContractAddress } from '@/features/approver/utils';
import { RpcStacksSelectors } from '@/shared/selectors/rpc-stacks.selectors';
import { deserializeTransaction } from '@stacks/transactions';

import { Approver, Box, Text } from '@leather.io/ui/native';

export function ContractCallSummarySection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  const contractAddress = getContractAddress(tx.payload);
  const { functionName, contractName } = tx.payload;

  return (
    <Approver.Section testID={RpcStacksSelectors.ContractCallSummarySection}>
      <Box gap="4">
        <Text variant="label01">{functionName.content}</Text>
        <Text variant="body02">{contractAddress + '.' + contractName.content}</Text>
      </Box>
    </Approver.Section>
  );
}
