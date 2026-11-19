import { assertContractCallPayload } from '@/features/approver/utils';
import { t } from '@lingui/core/macro';
import { PostConditionMode, deserializeTransaction } from '@stacks/transactions';

import { Callout } from '@leather.io/ui/native';

export function AllowModePostConditionWarning({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);
  const hasPostConditions = tx.postConditions.values.length > 0;

  if (tx.postConditionMode === PostConditionMode.Allow) {
    if (hasPostConditions) {
      return (
        <Callout title={t`Allow mode`} variant="warning">
          {t`The transfers shown will be checked, but this transaction can also move any other assets — including from your account — without limit. Only confirm if you fully trust the contract.`}
        </Callout>
      );
    }
    return (
      <Callout title={t`This is an “Allow Mode” transaction`} variant="warning">
        {t`By approving, this app can move your assets anytime, without asking again. Only proceed if you fully trust it.`}
      </Callout>
    );
  }

  if (tx.postConditionMode === PostConditionMode.Originator) {
    return (
      <Callout title={t`Originator mode`} variant="default">
        {hasPostConditions
          ? t`Only the transfers shown below can move assets out of your account. Assets owned by contracts aren't restricted.`
          : t`No assets will be transferred from your account by this transaction. Assets owned by contracts aren't restricted.`}
      </Callout>
    );
  }

  return (
    <Callout title={t`Standard checks`} variant="default">
      {hasPostConditions
        ? t`Only the transfers shown are allowed. Any other movement of assets will cancel the transaction.`
        : t`No asset transfers are permitted. Any movement of assets will cancel the transaction.`}
    </Callout>
  );
}
