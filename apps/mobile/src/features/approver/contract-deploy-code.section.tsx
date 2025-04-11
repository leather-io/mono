import { CodeCard } from '@/features/approver/components/code-card';
import { deserializeTransaction } from '@stacks/transactions';

import { Approver } from '@leather.io/ui/native';

import { assertContractDeployPayload } from './utils';

export function ContractDeployCodeSection({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractDeployPayload(tx.payload);

  return (
    <Approver.Section noTopPadding>
      <CodeCard codeBody={tx.payload.codeBody.content} />
    </Approver.Section>
  );
}
