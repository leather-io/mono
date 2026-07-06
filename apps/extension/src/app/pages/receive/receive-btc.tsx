import { analytics } from '@shared/utils/analytics';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useNativeSegwitAccountIndexAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveBtcModalProps {
  type?: 'btc' | 'btc-taproot';
  onClose(): void;
}

export function ReceiveBtcModal({ type = 'btc', onClose }: ReceiveBtcModalProps) {
  const toast = useToast();

  const currentAccount = useCurrentAccountId();
  const policy = useCurrentPolicy();
  const nativeSegwitAddress = useNativeSegwitAccountIndexAddressIndexZero(currentAccount);
  const taprootAddress = useZeroIndexTaprootAddress(currentAccount);

  const singleSigBtcAddress = type === 'btc-taproot' ? taprootAddress : nativeSegwitAddress;
  const singleSigAddress = policy ? undefined : singleSigBtcAddress;
  const address = policy?.chain === 'bitcoin' ? policy.address : singleSigAddress;
  const title = type === 'btc-taproot' ? 'BTC TAPROOT' : 'BTC';

  if (!address) return null;

  return (
    <ReceiveTokensLayout
      address={address}
      onClose={onClose}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_btc_address_to_clipboard', { type });
        await copyToClipboard(address);
        toast.success('Copied to clipboard!');
      }}
      title={title}
    />
  );
}
