import { DismissibleCallout } from './dismissible-callout';

const sunsetCalloutMessageId = 'ordinals-runes-sunset';

export function OrdinalsRunesSunsetCallout() {
  return (
    <DismissibleCallout
      messageId={sunsetCalloutMessageId}
      variant="warning"
      title="Leather no longer supports Ordinals, Runes, BRC-20, SRC-20, and Stamps"
    >
      If you hold these assets, restore your wallet in another wallet that supports them to access
      and transfer them.
    </DismissibleCallout>
  );
}
