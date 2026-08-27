import { t } from '@lingui/core/macro';

import { Callout } from '@leather.io/ui/native';

interface PsbtRequestNoBroadcastWarningLabelProps {
  origin?: string;
}
export function PsbtRequestNoBroadcastWarningLabel({
  origin,
}: PsbtRequestNoBroadcastWarningLabelProps) {
  return (
    <Callout title={t`Leather won't broadcast this transaction`} variant="warning">
      {origin
        ? t`Leather will sign this transaction and hand it to ${origin}, which can broadcast it at any time — including later, when the fee you chose may no longer be enough. Continue only if you trust ${origin}`
        : t`Leather will sign this transaction and hand it to this app, which can broadcast it at any time — including later, when the fee you chose may no longer be enough. Continue only if you trust this app.`}
    </Callout>
  );
}
