import { analytics } from '@shared/utils/analytics';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useBackgroundLocationRedirect } from '@app/routes/hooks/use-background-location-redirect';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useNativeSegwitAccountIndexAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveBtcModalProps {
  type?: 'btc' | 'btc-taproot';
}

export function ReceiveBtcModal({ type = 'btc' }: ReceiveBtcModalProps) {
  useBackgroundLocationRedirect();

  const toast = useToast();

  const currentAccount = useCurrentAccountId();
  const nativeSegwitAddress = useNativeSegwitAccountIndexAddressIndexZero(currentAccount);
  const taprootAddress = useZeroIndexTaprootAddress(currentAccount);

  const address = type === 'btc-taproot' ? taprootAddress : nativeSegwitAddress;
  const title = type === 'btc-taproot' ? 'BTC TAPROOT' : 'BTC';

  return (
    <ReceiveTokensLayout
      address={address}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_btc_address_to_clipboard', { type });
        await copyToClipboard(address);
        toast.success('Copied to clipboard!');
      }}
      title={title}
    />
  );
}
