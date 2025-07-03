import { useGetContractInterface } from '@/queries/stacks/contract-interface.query';
import { t } from '@lingui/macro';
import { cvToString, deserializeTransaction } from '@stacks/transactions';

import { Approver, Box, Text } from '@leather.io/ui/native';

import { assertContractCallPayload, getContractAddress } from './utils';

export function ContractCallArgsSection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  const contractAddress = getContractAddress(tx.payload);
  const { functionArgs, functionName, contractName } = tx.payload;

  const { data } = useGetContractInterface(contractAddress, contractName.content);

  return (
    <Approver.Section>
      <Box>
        <Text>{t({ id: 'approver.contract-arguments.title', message: 'Contract arguments' })}</Text>
      </Box>
      <Box>
        {functionArgs.map((fa, index) => {
          const strValue = cvToString(fa);
          const func = data?.functions.find(fn => fn.name === functionName.content);
          return (
            <Box key={strValue}>
              <Text variant="caption01" color="ink.text-subdued">
                {func?.args[index]?.name ??
                  t({
                    id: 'approver.contract-arguments.arg-title',
                    message: `Argument ${index + 1}`,
                  })}
              </Text>
              <Text variant="label01">{strValue}</Text>
            </Box>
          );
        })}
      </Box>
    </Approver.Section>
  );
}
