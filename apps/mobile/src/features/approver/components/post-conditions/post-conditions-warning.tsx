import { assertContractCallPayload } from '@/features/approver/utils';
import { t } from '@lingui/core/macro';
import { PostConditionMode, deserializeTransaction } from '@stacks/transactions';

import { Callout } from '@leather.io/ui/native';

export function AllowModePostConditionWarning({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  if (tx.postConditionMode === PostConditionMode.Allow) {
    return (
      <Callout title={t`This is an “Allow Mode” transaction`} variant="warning">
        {t`By approving, this app can move your assets anytime, without asking again. Only proceed if you fully trust it.`}
      </Callout>
    );
  }
  return null;
}
