import { analytics } from '@shared/utils/analytics';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useBackgroundLocationRedirect } from '@app/routes/hooks/use-background-location-redirect';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

import { ReceiveBtcModalWarning } from './components/receive-btc-warning';
import { ReceiveTokensLayout } from './components/receive-tokens.layout';

export function ReceiveOrdinalModal() {
  useBackgroundLocationRedirect();
  const toast = useToast();
  const btcAddressTaproot = useZeroIndexTaprootAddress();

  return (
    <ReceiveTokensLayout
      address={btcAddressTaproot}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_address_to_add_new_inscription');
        await copyToClipboard(btcAddressTaproot);
        toast.success('Copied to clipboard!');
      }}
      title="ORD. INSCRIPTION"
      warning={<ReceiveBtcModalWarning message="Deposit only Ordinal inscriptions here" />}
    />
  );
}
