import { CodeCard } from '@/features/approver/components/code-card';
import { RpcStacksSelectors } from '@/shared/selectors/rpc-stacks.selectors';
import { deserializeTransaction } from '@stacks/transactions';

import { Approver } from '@leather.io/ui/native';

import { assertContractDeployPayload } from './utils';

export function ContractDeployCodeSection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractDeployPayload(tx.payload);

  return (
    <Approver.Section testID={RpcStacksSelectors.ContractDeployCodeSection}>
      <CodeCard codeBody={tx.payload.codeBody.content} />
    </Approver.Section>
  );
}
