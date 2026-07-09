import { t } from '@lingui/core/macro';

import { Callout } from '@leather.io/ui/native';

interface PsbtRequestUnknownOutputWarningLabelProps {
  origin?: string;
}
export function PsbtRequestUnknownOutputWarningLabel({
  origin,
}: PsbtRequestUnknownOutputWarningLabelProps) {
  return (
    <Callout title={t`Unverified recipient`} variant="warning">
      {origin
        ? t`This transaction sends funds to an output Leather can’t display as an address. Continue only if you trust ${origin}`
        : t`This transaction sends funds to an output Leather can’t display as an address. Continue only if you trust this app.`}
    </Callout>
  );
}
