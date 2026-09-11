import { isTaprootDerivationPath } from '@leather.io/bitcoin';
import { Link } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';

import { DismissibleCallout } from './dismissible-callout';

const sunsetCalloutMessageId = 'ordinals-runes-sunset';
const deprecationGuideUrl =
  'https://app.leather.io/posts/deprecation-of-ordinals-inscriptions-support-in-leather';

export function OrdinalsRunesSunsetCallout() {
  const { isLoading, utxos } = useCurrentUtxos();

  if (isLoading) return null;

  const hasTaprootUtxos = [...utxos.confirmed, ...utxos.inbound, ...utxos.available].some(utxo =>
    isTaprootDerivationPath(utxo.path)
  );

  if (!hasTaprootUtxos) return null;

  return (
    <DismissibleCallout
      messageId={sunsetCalloutMessageId}
      variant="warning"
      title="Leather no longer supports Ordinals, Runes, BRC-20, SRC-20, and Stamps"
    >
      If you hold these assets, restore your wallet in another wallet that supports them to access
      and transfer them.{' '}
      <Link
        display="inline"
        textStyle="caption.01"
        onClick={() => openInNewTab(deprecationGuideUrl)}
      >
        Learn more
      </Link>
    </DismissibleCallout>
  );
}
