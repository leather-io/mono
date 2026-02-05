import { analytics } from '@shared/utils/analytics';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useBackgroundLocationRedirect } from '@app/routes/hooks/use-background-location-redirect';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useNativeSegwitAccountIndexAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveBtcModalType {
  type?: 'btc' | 'btc-stamp';
}

export function ReceiveBtcModal({ type = 'btc' }: ReceiveBtcModalType) {
  useBackgroundLocationRedirect();

  const toast = useToast();

  const currentAccount = useCurrentAccountId();

  const activeAccountBtcAddress = useNativeSegwitAccountIndexAddressIndexZero(currentAccount);

  return (
    <ReceiveTokensLayout
      address={activeAccountBtcAddress}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_btc_address_to_clipboard', { type });
        await copyToClipboard(activeAccountBtcAddress);
        toast.success('Copied to clipboard!');
      }}
      title={type === 'btc-stamp' ? 'BITCOIN STAMP' : 'BTC'}
    />
  );
}
