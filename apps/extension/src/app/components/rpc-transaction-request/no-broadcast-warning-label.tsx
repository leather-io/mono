import { Callout } from '@leather.io/ui';

const noBroadcastWarningTitle = "Leather won't broadcast this transaction";

interface NoBroadcastWarningLabelProps {
  origin: string;
}
export function NoBroadcastWarningLabel({ origin }: NoBroadcastWarningLabelProps) {
  return (
    <Callout variant="warning" title={noBroadcastWarningTitle}>
      Leather will sign this transaction and hand it to {origin}, which can broadcast it at any time
      — including later, when the fee you chose may no longer be enough. Continue only if you trust{' '}
      {origin}
    </Callout>
  );
}
