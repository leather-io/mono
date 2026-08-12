import { Callout } from '@leather.io/ui';

interface PsbtRequestSighashWarningLabelProps {
  origin: string;
  outputsNotGuaranteed?: boolean;
}
export function PsbtRequestSighashWarningLabel({
  origin,
  outputsNotGuaranteed,
}: PsbtRequestSighashWarningLabelProps) {
  if (outputsNotGuaranteed)
    return (
      <Callout variant="error" title="Signing does not guarantee where the funds go">
        The recipient and amount shown are not locked and can be changed after you sign. Only
        continue if you fully trust {origin}
      </Callout>
    );

  return (
    <Callout variant="warning" title="Be careful with this transaction">
      The details of this transaction are not guaranteed and could be modified later. Continue only
      if you trust {origin}
    </Callout>
  );
}
