import { t } from '@lingui/core/macro';

import { Callout } from '@leather.io/ui/native';

interface PsbtRequestSighashWarningLabelProps {
  origin?: string;
}
export function PsbtRequestSighashWarningLabel({ origin }: PsbtRequestSighashWarningLabelProps) {
  return (
    <Callout title={t`Be careful with this transaction`} variant="warning">
      {origin
        ? t`The details of this transaction are not guaranteed and could be modified later. Continue only if you trust ${origin}`
        : t`The details of this transaction are not guaranteed and could be modified later. Continue only if you trust this app.`}
    </Callout>
  );
}
