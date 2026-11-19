import { PostConditionMode, type PostConditionModeName } from '@stacks/transactions';

import { Callout } from '@leather.io/ui';

interface PostConditionModeWarningProps {
  mode: PostConditionMode | PostConditionModeName;
  hasPostConditions: boolean;
}
export function PostConditionModeWarning({
  mode,
  hasPostConditions,
}: PostConditionModeWarningProps) {
  if (mode === PostConditionMode.Allow || mode === 'allow') {
    if (hasPostConditions)
      return (
        <Callout variant="warning" mb="space.03" title="Allow mode">
          The transfers shown will be checked, but this transaction can also move any other assets —
          including from your account — without limit. Only confirm if you fully trust the contract.
        </Callout>
      );
    return (
      <Callout
        variant="warning"
        mb="space.03"
        title="This transaction can transfer any of your assets"
      >
        If you confirm, you allow it to transfer any of your tokens. Only confirm if you trust and
        have verified the contract.
      </Callout>
    );
  }

  if (mode === PostConditionMode.Originator || mode === 'originator')
    return (
      <Callout variant="default" mb="space.03" title="Originator mode">
        {hasPostConditions
          ? "Only the transfers shown below can move assets out of your account. Assets owned by contracts aren't restricted."
          : "No assets will be transferred from your account by this transaction. Assets owned by contracts aren't restricted."}
      </Callout>
    );

  return (
    <Callout variant="default" mb="space.03" title="Standard checks">
      {hasPostConditions
        ? 'Only the transfers shown are allowed. Any other movement of assets will cancel the transaction.'
        : 'No asset transfers are permitted. Any movement of assets will cancel the transaction.'}
    </Callout>
  );
}
